const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

const config = {
    // watch: true,
    // devtool: false,
    stats: {
        warnings: false
    },
    entry: {index: path.join(__dirname, 'src', 'index.js')},
    optimization: {
        minimize: true,
    },
    module: {
        rules: [
            {
                exclude: /node_modules/
            },
            {
                test: /\.(js|jsx|css)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                exclude: '/src/assets/'
            }
        ],

    },

    plugins: [
        new Dotenv(),
        new HtmlWebPackPlugin({
            template: path.join(__dirname, 'public', 'index.html'),
            filename: 'index.html',
            manifest: path.join(__dirname, 'public', 'manifest.json'),
        }),
        new CopyPlugin({
            patterns: [
                {from: "src/assets", to: "assets"},
                {from: "public/robots.txt", to: ""},
            ],
        }),
        new webpack.HotModuleReplacementPlugin(),


    ],


    devServer: {

        static: {
            directory: path.join(__dirname, 'src'),
        },

        host: "lemoni.local.com",

        port: 3000,
        hot: true,
        compress: true,
        liveReload: true,
        historyApiFallback: true,
    },


};


module.exports = config;