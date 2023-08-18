const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
    mode: 'development',
    entry: {
        main: path.resolve(__dirname, 'src', 'index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true,
        assetModuleFilename: '[name][ext]'
    },
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist')
        },
        port: 4000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true
    },
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ]
                    }
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|ico)$/i,
                use:{
                    loader: 'file-loader'
                }
            }
        ],
    }, 
    plugins: [
        new HtmlWebpackPlugin({
            title: 'For a fordable Tents design, Tent repair, tent for hire and other services visit | Quick One Service',
            filename: 'index.html',
            template: 'src/template.html',
        }),
        new BundleAnalyzerPlugin(),
        //plugin to extract css to a separate file
        new MiniCssExtractPlugin({
            filename: 'kyalo.[contenthash].css',
        }),
    ]
}