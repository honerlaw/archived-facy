var webpack = require("webpack");

module.exports = {
    entry: './ts/App.tsx',
    output: {
        filename: '../bundle.js'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader' },
            { test: /\.scss$/, loader: "style-loader!css-loader!sass-loader" }
        ]
    }
    /*plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: false}),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]*/
}
