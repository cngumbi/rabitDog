const path = require('path');
const glob = require('glob');
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");


const ALL_FILES = glob.sync(path.join(__dirname, "src/*.js"));
//purgeProduction has an error to be handled 
exports.purgeProduction = () => ({
    plugins: [
        new PurgeCSSPlugin({
            paths: ALL_FILES, // Consider extracting ass a parameter
            extractors: [
                {
                    extractor: (context)=>
                        context.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
                    extensions: ["html"],
                }
            ]
        }),
    ]
});
//--------------------------------------------------------
exports.prodServer = () => ({
    optimization: { 
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "initial"
                }
            },
            minSize: {
                javascript: 20000,
                "css/min-extra": 10000
            },
        },
        runtimeChunk: {
            name: "runtime"
        }
    },
    output: {
        chunkFilename: "[name].[contenthash].js",
        filename: "[name].[contenthash].js",
        assetModuleFilename: "[name].[contenthash][ext][query]",
    },
    recordsPath: path.join(__dirname, "records.json"),
    /*performance: {
        hints: "warning",  // 'error' or false are valid too
        maxEntrypointSize: 50000, // in bytes, default 250k
        maxAssetSize: 100000, // in bytes
    },*/
});