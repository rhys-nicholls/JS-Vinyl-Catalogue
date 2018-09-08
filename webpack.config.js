const path = require('path'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: [ './src/app.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js'
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html'
    })
  ],
  target: 'node',
  externals: [nodeExternals()]
}