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
    target: 'node',
    node: {
        __dirname: true,
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
                test: /\.(png|jpg|jpe?g|gif|svg|ico)$/i,
                type: 'asset/resource',
                //use:{
                //    loader: 'url-loader',
                //    options: {
                //        limit: 8192,
                //        name: '[path][name].[ext]',
                //        outputPath: 'uploads'
                //    },
                //},
                
            },
            //{
            //    test: /\.(png|jpg|jpe?g|gif|svg|ico)$/i,
            //    include: path.resolve(__dirname, 'src'),
            //    type: "assets/resource",
            //      generator: {
            //          filename: "assets/[name][ext]",
            //      }
            //}
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