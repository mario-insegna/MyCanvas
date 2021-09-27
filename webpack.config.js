/// <binding ProjectOpened='Watch - Development' />
"use strict";

module.exports = {
    devtool: "source-map",
    entry: "./scripts/app.tsx",
    output: {
        filename: "./dist/bundle.js"
    },
    resolve: {
        extensions: ["", ".Webpack.js", ".web.js", ".ts", ".js", ".tsx"]
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "ignore-loader" },
            {
                test: /\.ts(x)?$/,
                exclude: /(node_modules|bower_components)/,
                loader: "ts-loader"
            }
        ]
    }
};