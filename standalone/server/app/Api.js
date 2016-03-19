module.exports = class Api {
    constructor(app, config) {
        this.app = app;
        this.config = config;
    }

    putResource(name, callback) {
        this.app.get('/api/' + name, (req, res)=> {
            res.set('Content-Type', 'application/json');
            res.send(callback(req));
        });
    }

    load() {
        //this.putResource('clusters', req=>this.result.clusterContainers);
        this.putResource('files', this.getFiles.bind(this));
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

    getLogs(req) {
        var from = Number(req.query.from);
        var to = Number(req.query.to);
        if (from < 0) {
            from = 0;
        }
        if (from >= this.result.allLogEntries.length) {
            from = this.result.allLogEntries.length - 1;
        }
        if (to < 0) {
            to = 0;
        }
        if (to >= this.result.allLogEntries.length) {
            to = this.result.allLogEntries.length - 1;
        }

        return this.result.allLogEntries.slice(from, to + 1).map(l=> {
            return {
                Type: l.header.type,
                Timestamp: l.header.timestamp,
                Message: l.header.message,
                Lines: l.lines,
                Thread: l.header.thread,
                Id: l.Id,
                Causes: l.GetStackTrace()

            };
        });
    }


};