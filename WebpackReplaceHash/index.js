const path = require('path');
const cheerio = require('cheerio');
const fse = require('fs-extra');

var currentPath = path.resolve(__dirname, '../');
var js2html = {}; // key是js文件路径，value是html文件的路径的数组
var jsEntire = {}; // key是js文件路径，value是html文件的路径的数组

function getFiles(context) {
    fse.readdir(context, function(err, files) {
        if (err) return console.error(err);

        files.forEach(function(file) {
            if (/node\_modules$/.test(file) || /^\./.test(file)) {
                return;
            };
            getJsSrcInHTML(file,context);
        });
    });
}

function getJsSrcInHTML(file,context) {
    // 查看file类型————文件或者目录等
    fse.stat(path.resolve(context, file), function(err, stats) {
        if (stats.isFile() && /\.html$/.test(file)) {
            fse.readFile(path.resolve(context, file), function(err, data) {
                if (err) return console.error(err);

                var $ = cheerio.load(data.toString(), {
                    decodeEntities: false
                });
                var jsLinks = $('script');

                jsLinks.map(function(i, link) {
                    var jsSrc = $(link).attr('src');
                    var jsEntireSrc = path.resolve(context, jsSrc);

                    jsEntire[jsEntireSrc] = jsSrc;
                    addJsSrc.call(js2html, jsEntireSrc, file);
                })

                log(function () {
                    console.log('++++js2html++++++++');
                    console.log(js2html);
                    console.log('++++jsEntire++++++++');
                    console.log(jsEntire);
                })

            });
        } else if (stats.isDirectory()) { // 目录s
            console.log('++++++目录s+');
            console.log(file);
            getFiles(path.resolve(context, file));
        }
    })
}

function addJsSrc(jsEntireSrc, jsSrc) {
    if (!this[jsEntireSrc] || !Array.isArray(this[jsEntireSrc])) {
        this[jsEntireSrc] = [];
    }

    this[jsEntireSrc].push(jsSrc);
}

function log(fn){
    if(console.timer){
        clearTimeout(console.timer);
    }

    console.timer = setTimeout(function(){
        fn()
    },200);
}


function WebpackReplaceHash() {

}

WebpackReplaceHash.prototype.apply = function(compiler) {

    compiler.plugin('after-emit', function(compilation) {
        var entry = compilation.options.entry;
        console.log('-------------');
        console.log(entry);
        console.log('-------------');
        getFiles(currentPath);
    })

};

module.exports = WebpackReplaceHash;
