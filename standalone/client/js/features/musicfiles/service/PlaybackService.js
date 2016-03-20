var Howl = require('howler').Howl;
module.exports = class PlaybackService {
    constructor(utils) {
        this.utils = utils;
        this.fadeDuration = 2000;
    }

    /**
     * @param musicFile{MusicFile}
     */
    play(musicFile, callback, from, duration) {

        this.stop();
        var self = this;
        var audio = this.audio = new Howl({
            urls: [this.utils.getApi("file/" + encodeURIComponent(musicFile.filePath))],
            onloaderror: (a)=> {
                debugger;
            },
            onerror: (a)=> {
                debugger;
            },
            onload: function () {
                var audio = this;
                if (from != null && duration != null) {
                    var length = audio._duration * 1000;
                    if (duration > length) {
                        duration = length;
                    }
                    if (from == 'random') {
                        from = Math.random() * (length - duration);
                    }
                    else if (from + duration > length) {
                        from = length - duration;
                    }
                    console.log('from', from);
                    console.log('duration', duration);
                    console.log('length', length);
                    audio.pos(from / 1000);
                    self.fadeOutTimeout = setTimeout(()=> {
                        audio.fade(1, 0, self.fadeDuration, ()=> {
                            audio.unload();
                        });
                    }, duration - self.fadeDuration)
                }
                audio.play();
                if (from != null) {
                    audio.pos(from / 1000);
                }
                audio.fade(0, 1, self.fadeDuration)

            }
        });
        this.musicFile = musicFile;
    }

    stop() {
        clearTimeout(this.fadeOutTimeout);
        if (this.audio) {
            this.audio.fade(1, 0, this.fadeDuration, this.audio.unload.bind(this.audio));
            delete this.audio;
            delete this.musicFile;
        }
    }
};