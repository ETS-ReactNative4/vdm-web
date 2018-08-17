var userHome = require('../node_modules/user-home');
console.log(userHome);
var webpack = require(userHome + '/AppData/Roaming/npm/node_modules/webpack')
var path = require('path');
var HtmlWebpackPlugin = require(userHome + '/AppData/Roaming/npm/node_modules/html-webpack-plugin/');
var CopyWebpackPlugin = require(userHome + '/AppData/Roaming/npm/node_modules/html-webpack-plugin/');
var $ = require("jquery")

module.exports = {

    devServer: {
       /* contentBase: path.join(__dirname, "dist"),*/
        compress: true,
        port: 9000
    },

    entry: path.resolve(__dirname, '../src/app.js'),

    output: {
        path: path.resolve(__dirname, '../build/public'),
        filename: 'bundle.js'
    },
    resolveLoader: {
        modules: [
            userHome + '/AppData/Roaming/npm/node_modules'
        ]
    },

    resolve: {
        modules: [
            userHome + '/AppData/Roaming/npm/node_modules'
        ]
    },

    externals: {
        'react': 'React',
        'react/addons': true
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: path.resolve(__dirname, '../src'),
                query: {
                    presets: ['react']
                }
            }, {
                test: /\.(png|jpeg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'img/[path][name].[ext]',
                            context: './img'
                        }
                    }
                ]
            }
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            inject: 'body'
        }, new CopyWebpackPlugin([
            {
                from: '../src/*.html',
                to: path.resolve(__dirname, 'dist')
            }
        ]))
    ]
};