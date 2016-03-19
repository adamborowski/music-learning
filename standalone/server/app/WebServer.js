var express = require('express');
var Api = require('./Api');
var path = require('path');
var proxy = require('proxy-middleware');
var url = require('url');
module.exports = class WebServer {
    constructor(config) {
        this.config = config;
    }

    start() {
        var app = express();
        //app.get('/html', function (req, res) {
        //var template = tmpl.getTemplateRelative("templates/result.html.twig");
        //
        //var message = template.render({
        //    clusterContainers,
        //    threshold,
        //    version: require('../package.json').version
        //});
        //res.send(message);
        //});

        var api = new Api(app, {files: this.config.files, sourcePath: this.config.sourcePath});
        api.load();

        if (this.config.devServer) {
            app.use('/', proxy(url.parse('http://localhost:' + this.config.devServerPort)));
        }
        else {
            var staticPath = path.resolve(__dirname, '../../client/build/');
            console.log('\n static path: ' + staticPath);
            app.use('/', express.static(staticPath));
        }
        app.listen(this.config.port, ()=> {
            process.stderr.write(`\nView report on http://localhost:${this.config.port}\n`);
        });
    }


};