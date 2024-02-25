const { mode } = require('webpack-nano/argv');
const path = require('path');
const { merge } = require('webpack-merge');
const commonParts = require('./config/webpack.common');
const devParts = require('./config/webpack.dev');
const prodParts = require('./config/webpack.prod');


const cssLoaders = [commonParts.autoprefix()];

const commonConfig = merge([
    commonParts.clean(),
    commonParts.startPoint,
    commonParts.extractCSS({ loaders: cssLoaders }),
    commonParts.loadImages({ limit: 15000 }),
    commonParts.loadFonts({ limit: 50000}),
    commonParts.page(),
    commonParts.loadJavascript(),
]);
const productionConfig = merge([
    //prodParts.purgeProduction(), //has an error
    commonParts.generateSourceMaps({ type: "source-map" }),
    prodParts.prodServer(),
    commonParts.attachRevision(),
    commonParts.minifyJavascript(),
    commonParts.minifyCSS({ options: { preset: ["default"]}})
]);

const developmentConfig = merge([
    devParts.devServer(),
]);
const getConfig = (mode)=>{
    switch (mode){
        case "production":
            return merge(commonConfig, productionConfig, { mode });
        case "development":
            return merge(commonConfig, developmentConfig, { mode });
        default:
            throw new Error(`Trying to Use an Unknown ENV:mode, ${ mode }`);
    }
};

module.exports = getConfig(mode);
