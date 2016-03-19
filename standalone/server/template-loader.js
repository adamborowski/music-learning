var path = require('path');
var fs = require('fs');
var Twig = require('twig'), // Twig module
    twig = Twig.twig;       // Render function

module.exports = {
    getTemplate(file){

        return twig({data:fs.readFileSync(file, "UTF-8")});
    },
    getTemplateRelative(file) {
        return this.getTemplate(path.resolve(__dirname, file));
    }
};