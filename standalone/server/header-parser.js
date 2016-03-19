var headerRegex = /(\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d),\d\d\d\s+([A-Z]+)\s+\[(.*?)] (.*)/;

module.exports = class Parser {
    constructor(types) {
        this.allowedHeadersArray = types.split("|");
    }

    parseHeader(line) {
        var match = line.match(headerRegex);
        if (match == null) {
            return null;
        }
        var type = match[2];
        return {
            isAllowed: this.allowedHeadersArray.indexOf(type) >= 0,
            timestamp: match[1],
            type: type,
            thread: match[3],
            message: match[4]
        };
    }


};