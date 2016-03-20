export default class PlayerController {
    constructor($scope, PlaybackService, MusicFileService) {
        this.$scope = $scope;
        $scope.autoplay = true;
        this.playbackService = PlaybackService;
        $scope.playbackService = this.playbackService;

        MusicFileService.getFiles().then((files)=> {
            $scope.$on('musicend', (a)=> {
                if ($scope.autoplay) {
                    PlaybackService.play(files[files.indexOf(PlaybackService.lastMusicFile) + 1], null, 'random', 'default');
                }
            })
        });


    }

    set Duration(val) {
        if (!isNaN(val)) {
            if (val > 1) {
                this.playbackService.defaultDuration = val * 1000;
            }
        }
    }

    get Duration() {
        return this.playbackService.defaultDuration / 1000;
    }

    fullscreen() {
        this.$scope.fullscreen = !this.$scope.fullscreen;
    }
}
