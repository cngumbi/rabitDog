const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinizerPlugin = require('css-minimizer-webpack-plugin');


const APP_SOURCE = path.join(__dirname, "src");

exports.clean = () => ({
    output: {
        clean: true,
    }
});
exports.generateSourceMaps = ({ type }) => ({ devtool: type });
exports.startPoint = () => ({
    entry:[
        path.resolve(__dirname, 'src', 'index.js'),
    ],
});
exports.extractCSS = ({ options = {}, loaders = [] } = {})=>{
    return {
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        {loader: MiniCssExtractPlugin.loader, options},
                        'css-loader',

                    ].concat(loaders),
                    sideEffects: true,
                },
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash].css',
            }),
        ],
    }
};
exports.autoprefix = () => ({
    loader: "postcss-loader",
    options: {
        postcssOptions: { plugins: [require("autoprefixer")()]},
    }
});
exports.page = ()=>({
    plugins: [
        new HtmlWebpackPlugin({
            title: "For a fordable Tents design, Tent repair, tent for hire and other services visit | Quick One Service",
            filename: 'index.html',
            template: 'src/template.html'
        })
    ]
});
exports.loadImages = ({ limit } = {}) => ({
    module: {
        rules:[
            {
                test: /\.(png|jpg|jpe?g|gif|svg|ico)$/i,
                type: 'asset/resource',
                parser: { dataUrlCondition: { maxSize: limit }},
                
            },
        ]
    }
});
exports.loadFonts = ({ limit } = {}) => ({
    module: {
        rules: [
            {
                test: /\.(ttf|eot|woff|woof2)$/i,
                type: "asset/resource",
                parser: { dataUrlCondition: { maxSize: limit }},
            }
        ]
    }
});
exports.loadJavascript = () => ({
    module: {
        rules: [
            //Consider extracting include as a paramter
            {
                test: /\.js$/,
                include: APP_SOURCE,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'         
                }
            }
        ]
    }
});
exports.attachRevision = () => ({
    plugins: [
        new webpack.BannerPlugin({
            banner: new GitRevisionPlugin().version(),
        }),
    ]
});
exports.minifyJavascript = () => ({
    optimization: {
        minimizer: [ new TerserPlugin() ]
    },
});
exports.minifyCSS = ({ options }) => ({
    optimization: {
        minimizer: [
            new CssMinizerPlugin({ minimizerOptions: options }),
        ]
    }
});