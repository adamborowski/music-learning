"use strict";
var readline = require('readline');
var multimap = require('./multimap');
var process = require('process');
var fs = require('fs');
var argv = require('./argv');
var models = require('./log-models');
var Parser = require('./header-parser');
var FactoryDictionary = require('./factory-dictionary');
var Clusterizer = require('./clusterizer');
var result = require('./result');

var rl = readline.createInterface({
    input: argv.file ? fs.createReadStream(argv.file) : process.stdin,
    output: process.stdout,
    terminal: false
});

var parser = new Parser(argv.types);

var currentLogEntry = null;
var uniqueLogEntries = new FactoryDictionary((type) => new FactoryDictionary((message) => new models.UniqueLogEntry()));
var allLogEntries = [];

for (var type of parser.allowedHeadersArray) {
    uniqueLogEntries.get(type);//create order
}

rl.on('line', function (line) {
    var header = parser.parseHeader(line);
    if (header) {
        currentLogEntry = new models.LogEntry(header, line);
        currentLogEntry.Id = allLogEntries.length;
        allLogEntries.push(currentLogEntry);
        if (header.isAllowed) {
            uniqueLogEntries.get(header.type).get(header.message).addLogEntry(currentLogEntry);
        }
    }
    else {
        if (currentLogEntry) {
            currentLogEntry.addLine(line);
        }
    }
});
rl.on('close', ()=> {

    var clusterizer = new Clusterizer();

    uniqueLogEntries.forEach((key, val)=>val.forEach((key, val)=>val.onReady()));

    var clusterContainers = uniqueLogEntries.map((type, typeEntries) => clusterizer.clusterize(typeEntries.getValues(), argv.threshold));

    result.process(clusterContainers, process.stdout, argv.server, argv.threshold, allLogEntries);

});