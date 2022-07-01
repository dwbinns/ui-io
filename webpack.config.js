const path = require('path');
const { version } = require("./package.json");
const { DefinePlugin } = require("webpack");

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
        entry: './index.js',
        output: {
            publicPath: "/dist",
            filename: 'ui-io.js',
            path: path.resolve(__dirname, 'examples', 'dist'),
            library: {
                type: 'module',
            },
        }
    }, {
        ...config,
        mode: 'development',
        entry: './examples/index.js',
        output: {
            publicPath: "/dist",
            filename: 'examples.js',
            path: path.resolve(__dirname, 'examples', 'dist'),
        },
        devServer: {
            static: './examples',
        },
    }
];