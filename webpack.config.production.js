const path = require('path');
const _ = require('lodash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const getStorybookBabelConfig = require('./scripts/getStorybookBabelConfig.js');

const outputPath = path.resolve(__dirname, 'build');
const publicPath = '/';

// cf. @storybook/core/src/server/preview/iframe-webpack.config.js
module.exports = {
  mode: 'production',
  devtool: '#cheap-module-source-map',
  entry: ['./src/index.js'],
  output: {
    filename: '[name].[hash].js',
    path: outputPath,
    publicPath: publicPath,
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new CopyPlugin([
      { from: 'src/assets/*.png', to: outputPath, flatten: true },
      { from: 'src/assets/manifest.json', to: outputPath, flatten: true },
      { from: 'src/serviceWorker.js', to: outputPath, flatten: true },
    ])
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [ path.join(__dirname, 'src') ],
        exclude: [ path.join(__dirname, 'src/shims') ],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            ...getStorybookBabelConfig()
          },
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  }
};
