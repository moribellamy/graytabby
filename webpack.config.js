/* eslint-disable */

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin-next');

// see https://webpack.js.org/configuration/
module.exports = {
  mode: process.env.NODE_ENV || 'production',
  devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : '',
  entry: {
    background: './src/background.ts',
    app: './src/app.ts',
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader',
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return [require('autoprefixer')];
              },
            },
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [
    new CopyPlugin([
      { from: 'manifest.json', to: 'manifest.json' },
      { from: 'assets', to: 'assets' },
      { from: 'src/*.html', to: '', flatten: true },
    ]),
    new MiniCssExtractPlugin(),
    new WebpackShellPlugin({
      onBuildExit: 'bash build_hook.sh',
    }),
    // { // anonymous plugin to print actual config
    //   apply(compiler) {
    //     compiler.hooks.beforeRun.tapAsync('PrintConfigPlugin', function(compiler, callback) {
    //       console.dir(compiler.options)
    //       callback()
    //     })
    //   },
    // }
  ],
};
