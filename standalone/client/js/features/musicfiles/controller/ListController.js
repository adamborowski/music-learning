export default class ListController {
    constructor(MusicFileService) {
        this.logTypes = [];
        MusicFileService.getFiles().then(data=> {
            this.files = data.data;
        });
    }
}
