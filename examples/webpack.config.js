const path = require('path');
const { version } = require("../package.json");
const { DefinePlugin } = require("webpack");
const { cpSync } = require('fs');

cpSync("./web", "./dist", { recursive: true });

const config = {
    mode: 'development',
    experiments: {
        outputModule: true,
        topLevelAwait: true,
    },
    plugins: [
        new DefinePlugin({
            'process.env.VERSION': JSON.stringify(version),
        })
    ]
};

module.exports = [
    {
        ...config,
        entry: '../index.js',
        output: {
            publicPath: "/",
            filename: 'ui-io.js',
            path: path.resolve(__dirname, 'dist'),
            library: {
                type: 'module',
            },
        }
    }, {
        ...config,
        mode: 'development',
        entry: './src/index.js',
        output: {
            publicPath: "/",
            filename: 'examples.js',
            path: path.resolve(__dirname, 'dist'),
        },
        devServer: {
            static: './web',
            port: 8888
        },
    }
];