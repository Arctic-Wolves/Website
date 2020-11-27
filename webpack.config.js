const path = require('path');

// Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FsWebpackPlugin = require('fs-webpack-plugin');

const outputPath = path.resolve(__dirname, 'build/src');

module.exports = (env, argv) => ({
  name: 'client',
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devtool: 'cheap-module-source-map',
  entry: path.resolve(__dirname, 'src/client/index.jsx'),
  output: {
    path: outputPath,
    filename: '[name].bundle.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: [path.resolve(__dirname, 'src/client')],
      exclude: [/\.(spec\.js)$/],
      loader: 'babel-loader',
      options: {
        plugins: [
          ['@emotion', {
            sourceMap: argv.mode !== 'production',
            autoLabel: 'dev-only',
            cssPropOptimization: false
          }]
        ],
        presets: [
          '@babel/preset-env',
          '@babel/preset-react'
        ]
      }
    }]
  },
  plugins: [
    new FsWebpackPlugin([{
      type: 'delete',
      root: outputPath,
      files: null
    }], { verbose: true }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/client/index.html'),
      filename: 'index.html'
    })
  ]
});
