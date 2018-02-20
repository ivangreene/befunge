const path = require('path'),
   webpack = require('webpack');

module.exports = function(env) {
  return {
    entry: './src/index.js',
    output: {
      filename: env.dev ? 'befunge.js' : 'befunge.min.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'Befunge'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015']
          }
        }
      ]
    },
    plugins: env.dev ? [] : [
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false }
      })
    ]
  };
};
