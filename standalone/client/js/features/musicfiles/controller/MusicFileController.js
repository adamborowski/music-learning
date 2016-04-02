export default class MusicFileController {
    constructor($scope, PlaybackService) {
        this.$scope = $scope;
        this.playbackService = PlaybackService;
    }

    play() {
        this.playbackService.playDefault(this.$scope.file, this.onFileFinish.bind(this));
    }

    onFileFinish() {

    }
}
