const path = require('path');
const webpack = require('webpack');
const SizeLimiterPlugin = require('..');

module.exports = {
  context: __dirname,
  entry: {
    first: './main.js',
    second: './main.js'
  },
  output: {
    filename: '[name]-[hash].js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['env', { modules: false }]],
            plugins: ['syntax-dynamic-import']
          }
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [{ loader: 'file-loader' }]
      }
    ]
  },
  devtool: 'inline-source-map',
  plugins: [
    new SizeLimiterPlugin({
      onlyWarn: true,
      entries: {
        first: 10000,
        second: 19.2 * 1000
      },
      chunks: chunk => {
        return 10;
      }
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};
