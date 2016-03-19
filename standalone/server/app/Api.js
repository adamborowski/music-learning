var AbstractApi = require('../modules/AbstractApi');
var fs = require('fs');
var path = require('path');
module.exports = class Api extends AbstractApi {
    constructor(app, config) {
        super(app);
        this.config = config;
    }

    load() {
        //this.putResource('clusters', req=>this.result.clusterContainers);
        this.putResource('files', this.getFiles);
        this.putResourceAsync('file', this.getFile);
    }

    getFiles(req) {
        return this.config.files;//.map(a=> {
        //    return a.clusters.map(cluster=> {
        //        return {
        //            Type: cluster.Type,
        //            NumTotalEntries: cluster.NumEntries,
        //            NumUniqueEntries: cluster.NumUniqueEntries,
        //            LastMessage: cluster.LastMessage,
        //            FirstDate: cluster.FirstDate,
        //            LastDate: cluster.LastDate,
        //            LastLines: cluster.Message,
        //            LastCauses: cluster.LastCauses,
        //            UniqueLogEntries: cluster.uniqueLogEntries.map(u=> {
        //                return {
        //                    Causes: u.stackTrace,
        //                    Message: u.Message,
        //                    Type: u.Type,
        //                    Tokens: u.tokens,
        //                    CauseTokens: u.stackTraceTokens,
        //                    NumTotalEntries: u.NumEntries,
        //                    Entries: u.entries.map(e=> {
        //                        return {Message: e.header.message, Timestamp: e.header.timestamp, Id: e.Id};
        //                    })
        //                };
        //            })
        //        };
        //    });
        //});
    }

    getFile(request, response) {
        var filePath = path.resolve(this.config.sourcePath, request.query.file);
        var stat = fs.statSync(filePath);

        response.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });

        var readStream = fs.createReadStream(filePath);
        readStream.pipe(response);
    }


};