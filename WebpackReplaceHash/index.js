const path = require('path');
const cheerio = require('cheerio');
const fse = require('fs-extra');

const hashCacheSrc = './dist/cacheHash.json';
const currentPath = path.resolve(__dirname, '../');

const cachePath = path.resolve(currentPath, hashCacheSrc);
var oldCache;

if (fse.existsSync(hashCacheSrc)) {
    oldCache = require(cachePath);
} else {
    fse.outputFileSync(cachePath, '{"1":"1"}');
    oldCache = require(cachePath);
}

var updateJS = {};
var entry;
var outputFolder;
var chunkObj = {};

function getFiles(context) {
    fse.readdir(context, function(err, files) {
        if (err) return console.error(err);

        files.forEach(function(file) {
            if (/node\_modules$/.test(file) || /^\./.test(file)) {
                return;
            };
            getJsSrcInHTML(file, context);
        });
    });
}

function getJsSrcInHTML(file, context) {
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

                    if (updateJS[jsEntireSrc]) { // 当前js文件被修改了，需要进行替换
                        // 将src替换成manifest中的hash的文件名。
                        for (var entryName in entry) {
                            if (entry[entryName] === updateJS[jsEntireSrc]) {
                                $(link).attr('src', chunkObj[entryName]);
                            }
                        }
                    }
                });

                var json = $.html();
                var outputFile = path.join(outputFolder, file);

                fse.outputFileSync(outputFile, json);

            });
        } else if (stats.isDirectory()) { // 目录s
            getFiles(path.resolve(context, file));
        }
    })
}

// 获取哪些js文件改动了，需要进行更新。
function getChangedFiles() {
    // 可以通过比较mainfest.json的前后两次的那个属相变了来比较。目前还没有在compilation
    // 对象中找到相关信息。
    // 思路：webpack不会每次都对没有改动的文件进行重新打包，所以他是如何判断文件是否改变的呢？
}


function WebpackReplaceHash() {

}

WebpackReplaceHash.prototype.apply = function(compiler) {

    compiler.plugin('after-emit', function(compilation) {
        entry = compilation.options.entry;

        compilation.chunks.map(function(chunk) {
            chunkObj[chunk.name] = chunk.files[0];
            chunkObj[chunk.name + '.js'] = chunk.files[0];
            chunkObj[chunk.name + '.js.map'] = chunk.files[1];
        });

        getFiles(currentPath);

    })

    compiler.plugin('compilation', function(compilation, params) {
        compilation.plugin('record', function(compilation, records) {
            var cacheHash = {};
            compilation.chunks.map(function(chunk) {
                const requestFile = chunk.entryModule.userRequest;
                const hash = chunk.hash;
                cacheHash[requestFile] = hash;

                if (oldCache[requestFile] !== hash) {
                    updateJS[requestFile] = chunk.entryModule.rawRequest;
                }
            })

            var json = JSON.stringify(cacheHash, null, 2);
            outputFolder = compilation.options.output.path;
            var outputFile = path.join(outputFolder, 'cacheHash.json');

            fse.outputFileSync(outputFile, json);
        });
    });
};

module.exports = WebpackReplaceHash;
