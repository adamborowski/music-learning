module.exports = class MusicFile {
    constructor(tags) {
        this.parseTags(tags);
    }

    parseTags(tags) {
        this.fileName = tags.fileName;
        this.title = tags.title || tags.fileName;
        this.filePath = tags.filePath;
        this.tags = tags;
    }
};