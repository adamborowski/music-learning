"use strict";
var causeRegex = /^(.*?): (.*)$/;
const FIRST_ERROR = /^(?:\w+\.)+\w+: (.*)$/;
const CAUSED_BY_PREFIX = 'Caused by: ';
const CAUSED_BY_PREFIX_LENGTH = CAUSED_BY_PREFIX.length;
class LogEntry {
    constructor(header, line) {
        this.header = header;
        this.lines = [line];
    }

    get Type() {
        return this.header.type;
    }

    addLine(line) {
        this.lines.push(line);
    }

    /**
     * @return {null|String[]}
     */
    GetStackTrace() {
        if (this._stackTrace) {
            return this._stackTrace;//cache value
        }
        if (this.lines.length < 2) {
            return [];//not enough lines for stack trace
        }
        var firstErrorMatch = this.lines[1].match(FIRST_ERROR);
        if (firstErrorMatch == null) {
            return [];//it seems to be not a stack trace if there is no error at the beginning
        }
        var trace = [firstErrorMatch[0]];
        for (var i = 2; i < this.lines.length; i++) {
            var line = this.lines[i];
            if (line.startsWith(CAUSED_BY_PREFIX)) {
                trace.push(line.substr(CAUSED_BY_PREFIX_LENGTH));
            }
        }
        this._stackTrace = trace;
        return trace;
    }

    GetStackTraceTokens() {
        return this.GetStackTrace().map((a)=> {
            var pos = a.indexOf(':');
            if (pos == -1) {
                return "";
            }
            return a.substr(pos + 2);
        });
    }

    GetStackTraceErrorClasses() {
        return this.GetStackTrace().map((a)=> {
            var pos = a.indexOf(':');
            if (pos == -1) {
                return a;
            }
            return a.substr(0, pos);
        });
    }
}
class UniqueLogEntry {

    /**
     * @param entry {LogEntry}
     */
    init(entry) {
        /**
         * @type {LogEntry[]}
         */
        this.entries = [];
        this.firstLogEntry = entry;
        this.lastLogEntry = entry;
    }

    onReady() {
        this.createTokens(this.firstLogEntry);
        this.setupCauses();
        console.log("===========");
        console.log(this.Message);
        console.log("----------");
        console.log(this.tokens.join(" "));
    }

    setupCauses() {
        this.stackTrace = this.firstLogEntry.GetStackTrace();
        this.stackTraceErrorClasses = this.firstLogEntry.GetStackTraceErrorClasses();
        this.stackTraceTokens=[];
        this.firstLogEntry.GetStackTraceTokens().forEach(a=>this.stackTraceTokens.push(...this.getTokenForString(a)));
    }

    /**
     * @param logEntry {LogEntry}
     */
    addLogEntry(logEntry) {
        if (this.entries == null) {
            this.init(logEntry);
        }
        this.entries.push(logEntry);
        if (this.firstLogEntry.header.timestamp > logEntry.header.timestamp) {
            this.firstLogEntry = logEntry;
        }
        if (this.lastLogEntry.header.timestamp < logEntry.header.timestamp) {
            this.lastLogEntry = logEntry;
        }


    }

    /**
     * @param entry {LogEntry}
     */
    createTokens(entry) {
        this.tokens = this.getTokenForString(entry.header.message);
    }

    getTokenForString(str) {
        return str
            .replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g, "[URLREPLACED]")
            .replace(/\/?([\w_\-\.]+\/){2,}\w+/g, "[PATHREPLACED]")
            .replace(/(?:[a-f\d]*\d[a-f\d]*){5,}/g, "[HEXREPLACED]")
            .replace(/(?:[a-z]\w+\.)+([A-Z]\w+\w+)(?![\w])/g, "$1")
            .split((/[\W\d\-_\.]+/g));
    }

    get NumEntries() {
        return this.entries.length;
    }

    get FirstDate() {
        return this.firstLogEntry.header.timestamp;
    }

    get LastDate() {
        return this.lastLogEntry.header.timestamp;
    }

    get Type() {
        return this.firstLogEntry.header.type;
    }

    get Message(){
        return this.firstLogEntry.header.message;
    }
}


class LogCluster {
    /**
     *
     * @param uniqueLogs {UniqueLogEntry[]}
     */
    constructor(uniqueLogs) {
        this.uniqueLogEntries = uniqueLogs.sort((a, b)=>a.LastDate.localeCompare(b.LastDate));
        this._numEntries = this.uniqueLogEntries.reduce((val, uniqueLogEntry)=>uniqueLogEntry.NumEntries + val, 0);
        this._firstLogEntry = this.uniqueLogEntries[0];
        this._lastLogEntry = this.uniqueLogEntries[this.uniqueLogEntries.length - 1];
    }

    get NumEntries() {
        return this._numEntries;
    }

    get LastCauses(){
        return this._lastLogEntry.stackTrace;
    }

    get NumUniqueEntries() {
        return this.uniqueLogEntries.length;
    }

    get LastMessage() {
        return this._lastLogEntry.lastLogEntry.header.message;
    }

    /**
     * @return {string}
     */
    get LastLines() {
        return this._lastLogEntry.lastLogEntry.lines.join("\r\n");
    }

    get FirstDate() {
        return this._firstLogEntry.FirstDate;
    }

    get LastDate() {
        return this._lastLogEntry.LastDate;
    }

    get Type() {
        return this._firstLogEntry.Type;
    }
}

class ClusterContainer {
    /**
     *
     * @param clusters {LogCluster[]}
     */
    constructor(clusters) {
        this.clusters = clusters;
        this.doStats();
    }

    doStats() {
        this.clusters.sort((a, b)=>b.NumEntries - a.NumEntries);

        this._numClusters = this.clusters.length;
        this._numTotalEntries = 0;
        this._numUniqueEntries = 0;

        for (var logCluster of this.clusters) {
            this._numUniqueEntries += logCluster.NumUniqueEntries;
            this._numTotalEntries += logCluster.NumEntries;
        }
    }

    get NumClusters() {
        return this._numClusters;
    }

    get NumUniqueEntries() {
        return this._numUniqueEntries;
    }

    get Type() {
        return this.clusters[0].Type;
    }

    get NumTotalEntries() {
        return this._numTotalEntries;
    }
}

module.exports = {LogEntry, UniqueLogEntry, LogCluster, ClusterContainer};
