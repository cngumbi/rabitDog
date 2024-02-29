const path = require('path');
exports.devServer = () => ({
    watch: true,
    output: {
        filename: '[name].js',
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist')
        },
        port: 4000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true
    }
});