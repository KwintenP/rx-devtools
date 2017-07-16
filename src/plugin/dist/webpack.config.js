var path = require('path');
var webpack = require('webpack');
var ROOT = path.resolve(__dirname, 'src');
var DESTINATION = path.resolve(__dirname, 'dist');
module.exports = {
    context: ROOT,
    entry: {
        'content-script': './content-script/content-script.ts',
        'rx-devtools': './injected/rx-devtools.ts',
        'devtools': './devtools/devtools.ts',
        'background': './background/background.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: DESTINATION
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            ROOT,
            'node_modules'
        ]
    },
    module: {
        rules: [
            /****************
             * PRE-LOADERS
             *****************/
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader'
            },
            {
                enforce: 'pre',
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'tslint-loader'
            },
            /****************
             * LOADERS
             *****************/
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: 'awesome-typescript-loader'
            }
        ]
    },
    devtool: 'cheap-module-source-map',
    devServer: {}
};
//# sourceMappingURL=webpack.config.js.map