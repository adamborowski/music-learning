var tmpl = require('./template-loader');
var proxy = require('proxy-middleware');
var path = require('path');
var url = require('url');
var Api = require('./api');
module.exports = {
    /**
     *
     * @param clusterContainers ClusterContainer[]
     */
    process: function (clusterContainers, target, runServer, threshold, allLogEntries, devServer) {

        if (runServer) {

            //var outputTemplate = tmpl.getTemplateRelative("templates/result.txt.twig");
            //target.write(outputTemplate.render({
            //    clusterContainers,
            //    columnCount: process.stdout.columns,
            //    divider: '─'.repeat(process.stdout.columns)
            //}));


            var express = require('express');
            var app = express();


            app.get('/html', function (req, res) {
                var template = tmpl.getTemplateRelative("templates/result.html.twig");

                var message = template.render({
                    clusterContainers,
                    threshold,
                    version: require('../package.json').version
                });
                res.send(message);
            });


            var api = new Api(app, {clusterContainers, threshold, allLogEntries});
            api.load();

            if (devServer) {
                app.use('/', proxy(url.parse('http://localhost:8080')));
            }
            else {
                var staticPath = path.resolve(__dirname, '../logbrowser/build/');
                console.log('\n static path: ' + staticPath);
                app.use('/', express.static(staticPath));
            }
            app.listen(3000, function () {
                process.stderr.write('\nView report on http://localhost:3000');
            });
        }
        else {
            var template = tmpl.getTemplateRelative("templates/result.html.twig");

            var message = template.render({clusterContainers});
            target.write(message);
        }
    }
};