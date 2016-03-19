var FindFiles = require("node-find-files");
var path = require('path');
var id3 = require('id3js');

module.exports = class FileFinder {
    constructor(path) {
        this.path = path;
        this.type = 'mp3';
    }

    find() {

        return new Promise((resolve, reject)=> {


            var allPromises = [];


            var finder = new FindFiles({
                rootFolder: this.path,
                filterFunction: this.filter.bind(this)
            });

            finder.on("match", (filePath, stat)=> {
                allPromises.push(new Promise((resolve, reject)=> {
                    id3({file: filePath, type: id3.OPEN_LOCAL}, (err, tags) => {
                        // tags now contains your ID3 tags
                        tags.fileName = path.basename(filePath, ".mp3");
                        tags.filePath = path.relative(this.path, filePath);
                        resolve(tags);
                    });
                }));
            });
            finder.on("complete", function () {
                Promise.all(allPromises).then(resolve);
            });
            finder.on("error", function (err) {
                reject();
                console.log("Global Error " + err);
            });
            finder.startSearch();
        });
    }

    filter(filePath, stat) {
        if (!stat.isFile()) {
            return false;
        }
        if (path.extname(filePath).toLowerCase() == '.mp3') {
            return true;
        }
        return false;
    }
};