"use strict";

var levenstein = require('./array-levenshtein');
var clusterfck = require('../node_modules/clusterfck');
var models = require('./log-models');
var consoleWidth = process.stdout.columns;

module.exports = class Clusterizer {
    /**
     *
     * @param entries {UniqueLogEntry[]}
     * @param threshold
     * @return {ClusterContainer}
     */
    clusterize(entries, threshold) {
        this.threshold = threshold;
        if(entries.length==0){
            process.stderr.write(`\n# given empty array for clustering...`);

            return new models.ClusterContainer([]);
        }
        process.stderr.write(`\n# starting ${entries[0].Type} clustering...`);


        var clusters = clusterfck.hcluster(entries, this.metric.bind(this), clusterfck.COMPLETE_LINKAGE, threshold);
        /**
         * @type {LogCluster[]}
         */
        var logClusters = [];
        for (var cluster of clusters) {
            var uniqueLogEntries = [];
            this.linearizeCluster(cluster, uniqueLogEntries);
            logClusters.push(new models.LogCluster(uniqueLogEntries));
        }
        process.stderr.write(`\n# finished ${entries[0].Type} clustering.`);
        return new models.ClusterContainer(logClusters);
    }

    /**
     *
     * @param a {UniqueLogEntry}
     * @param b {UniqueLogEntry}
     * @returns {number}
     */
    metric(a, b) {

        if (a.stackTrace.length != b.stackTrace.length) {
            return Infinity;
        }
        if (a.stackTraceErrorClasses.length > 0) {
            //we have some causes, match if error classes are corresponding to each other
            for (var i = 0; i < a.stackTraceErrorClasses.length; i++) {
                if (a.stackTraceErrorClasses[i] != b.stackTraceErrorClasses[i]) {
                    return Infinity;
                }
            }
        }
        var ta = a.tokens;
        var tb = b.tokens;
        var messageDiff = levenstein(ta, tb) / Math.max(ta.length, tb.length);
        if (messageDiff < this.threshold) {

            //it could be matched, check causes similarity
            var ca = a.stackTraceTokens;
            var cb = b.stackTraceTokens;
            if (ca.length == 0 && cb.length == 0) {
                return messageDiff;//dont include similarity of causes when they not exist
            }
            var causeDiff = levenstein(ca, cb) / Math.max(ca.length, cb.length);
            return messageDiff / 2 + causeDiff / 2;
        }
        return messageDiff;
    }

    /**
     *
     * @param node
     * @param {UniqueLogEntry[]} output
     */
    linearizeCluster(node, output) {
        if (node.value) {
            output.push(node.value);
        }
        else {
            if (node.left) {
                this.linearizeCluster(node.left, output);
            }

            if (node.right) {
                this.linearizeCluster(node.right, output);
            }
        }
    }
};