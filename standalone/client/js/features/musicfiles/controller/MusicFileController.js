export default class MusicFileController {
    constructor($scope, PlaybackService) {
        this.$scope = $scope;
        this.playbackService = PlaybackService;
    }

    play() {
        this.playbackService.play(this.$scope.file);
    }
}
