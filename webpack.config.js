var webpack = require('webpack');

// webpack.config.js
module.exports = {
  entry: './js_src/main.js',
  output: {
    filename: 'the_game.js'
  },
  // plugins: [
  //   new webpack.optimize.ModuleConcatenationPlugin()
  // ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
};
