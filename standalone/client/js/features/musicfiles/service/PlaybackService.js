var Howl = require('howler').Howl;
module.exports = class PlaybackService {
    constructor(utils, $rootScope, MusicFileService) {
        this.utils = utils;
        this.defaultDuration = localStorage.getItem('default-duration') || 300000;
        this.fadeDuration = 2000;
        this.$rootScope = $rootScope;
        this._playFromStart = true;
        this.musicFileService = MusicFileService;
    }

    playDefault(musicFile, callback) {
        this.play(musicFile, callback, this.PlayFromStart ? 0 : 'random', this.defaultDuration);
    }

    playNextDefault() {
        this.musicFileService.getFiles().then((files)=> {
            this.playDefault(files[files.indexOf(this.lastMusicFile) + 1] || this.LoopList && files[0], null);
        });
    }

    playPrevDefault() {
        this.musicFileService.getFiles().then((files)=> {
            this.playDefault(files[files.indexOf(this.lastMusicFile) - 1] || this.LoopList && files[files.length - 1], null);
        });
    }

    /**
     * @param musicFile{MusicFile}
     */
    play(musicFile, callback, from, duration) {
        this.stop();
        if (musicFile == null) {
            return;
        }
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
                    if (duration == 'default') {
                        duration = self.defaultDuration;
                    }
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
                            delete self.audio;
                            delete self.musicFile;
                            self.$rootScope.$apply();
                            self.$rootScope.$broadcast('musicend')
                        });
                    }, duration - self.fadeDuration)
                }
                audio.play();
                if (from != null) {
                    audio.pos(from / 1000);
                }
                if (from > 0) {
                    audio.fade(0, 1, self.fadeDuration);
                }

            }
        });
        this.musicFile = musicFile;
        this.lastMusicFile = musicFile;
        var $scope = this.$rootScope;
        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
            $scope.$apply();
        }
    }

    get isPlaying() {
        return this.audio != null;
    }

    set PlayFromStart(val) {
        this._playFromStart = val;
        console.info('PlayFromStart set to ' + val);
    }

    get PlayFromStart() {
        return this._playFromStart;
    }

    get LoopList() {
        return this._loopList;
    }

    set LoopList(val) {
        this._loopList = val;
        console.info('LoopList set to ' + val);
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
