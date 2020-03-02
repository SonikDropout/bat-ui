const path = require('path');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
  entry: './src/renderer.js',
  output: {
    filename: 'renderer.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    // see below for an explanation
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            hotReload: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  externals: [
    function(context, request, callback) {
      if (
        /^path|fs|events|serialport|electron|drivelist|excel4node|usb-detection$/.test(
          request
        )
      ) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    },
  ],
  mode,
};
