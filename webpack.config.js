var path = require("path");
var webpack = require("webpack");

var Replace = require('./WebpackReplaceHash');

module.exports = {
    context: __dirname,
    entry: {
        demo: './demo.js',
        pageAHello: './pageA/hello.js'
    },
    output: {
        filename: '[name]_[chunkhash:6].js',
        path: path.resolve(__dirname, 'dist/'),
        publicPath: "/dist/"
    },
    devtool: 'source-map',
    plugins: [
        new webpack.LoaderOptionsPlugin({
            debug: true
        }),
        new Replace()
    ]
}
// _[chunkhash:6]
