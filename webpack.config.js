const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    team: './app/javascripts/team.js',
    login: './app/javascripts/login.js',
    match: './app/javascripts/match.js',
    market: './app/javascripts/market.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './app/team.html', to: "team.html" },
      { from: './app/login.html', to: "login.html" },
      { from: './app/match.html', to: "match.html" },
      { from: './app/market.html', to: "market.html" },
      { from: './app/images', to: "images" },
    ]),
  ],
  module: {
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      }
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  }
}
