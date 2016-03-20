export default class ListController {
    constructor($scope, MusicFileService, PlaybackService) {
        this.logTypes = [];
        $scope.playbackService = PlaybackService;
        MusicFileService.getFiles().then(data=> {
            this.files = data;
        });
    }
}
