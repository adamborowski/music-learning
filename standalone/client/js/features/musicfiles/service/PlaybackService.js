module.exports = class PlaybackService {
    constructor(utils) {
        this.utils = utils;
    }

    /**
     * @param musicFile{MusicFile}
     */
    play(musicFile) {
        this.stop();
        this.audio = new Audio(this.utils.getApi("file?file=" + musicFile.filePath));


        var musicStartTime = 1000;

        var listener = () => {
            this.audio.currentTime = musicStartTime;
            this.audio.play();
            this.audio.removeEventListener('canplaythrough', listener, false);
        };
        this.audio.addEventListener('canplaythrough', listener, false);

        this.musicFile = musicFile;
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
            delete this.audio;
            delete this.musicFile;
        }
    }
};