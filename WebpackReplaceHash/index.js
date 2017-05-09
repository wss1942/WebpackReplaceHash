const path = require('path');
const cheerio = require('cheerio');
const fse = require('fs-extra');

function getFiles() {
    var js2html = {}; // key是js文件路径，value是html文件的路径的数组

    var currentPath = path.resolve(__dirname, '../');

    fse.readdir(currentPath, function(err, files) {
        if (err) return console.error(err);

        files.forEach(function(file) {

            if (file !== 'node_modules' && /\.html$/.test(file)) {
                // 查看file类型————文件或者目录等
                fse.stat(path.resolve(currentPath, file), function(err, stats) {
                    if (stats.isFile()) {
                        fse.readFile(file, function(err, data) {
                            if (err) return console.error(err);

                            var $ = cheerio.load(data.toString(), {
                                decodeEntities: false
                            });
                            var jsLinks = $('script');

                            jsLinks.map(function(i,link){
                                var jsSrc = $(link).attr('src');
                                var jsEntireSrc = path.resolve(currentPath, jsSrc);


                                js2html[jsEntireSrc] = jsSrc;
                                console.log(js2html);
                            })
                        });
                    }
                })
                console.log(file);
            }
        });
    });
}

function getJsSrcInHTML() {

}


function WebpackReplaceHash() {

}

WebpackReplaceHash.prototype.apply = function(compiler) {

    compiler.plugin('after-emit', function(compilation) {
        var entry = compilation.options.entry;
        console.log('-------------');
        console.log(entry);
        console.log('-------------');
        getFiles();
    })

};

module.exports = WebpackReplaceHash;
