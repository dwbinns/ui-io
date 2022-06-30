const path = require('path');

module.exports = [
    {
        mode: 'development',
        entry: './index.js',
        output: {
            publicPath: "/dist",
            filename: 'ui-io.js',
            path: path.resolve(__dirname, 'examples', 'dist'),
            library: {
                type: 'module',
            },
        },
        devServer: {
            static: './examples',
        },
        experiments: {
            outputModule: true,
            topLevelAwait: true,
        },
    }, {
        mode: 'development',
        entry: './examples/index.js',
        output: {
            publicPath: "/dist",
            filename: 'examples.js',
            path: path.resolve(__dirname, 'examples', 'dist'),
        },
        experiments: {
            outputModule: true,
            topLevelAwait: true,
        },
    }
];