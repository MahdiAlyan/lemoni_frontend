const {merge} = require("webpack-merge");
const {EnvironmentPlugin} = require("webpack");
const commonConfig = require("./webpack.common.js");
const path = require('path');

function getCurrentTime() {
    var date = new Date();
    return date.getTime();
}

const devConfig = {
    mode: "development",
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'lemoni.local.' + getCurrentTime() + '.js',
        publicPath: '/',
    },
    plugins: [
        new EnvironmentPlugin({
             BaseUrl: "http://127.0.0.1:8000/api",
            // BaseUrl: "https://dev-api-skp.neruos.tech/api",
            //BaseUrl: "https://dev-api-lemoni.neruos.tech/api",
        }),

    ],
};

module.exports = merge(commonConfig, devConfig);