const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

require("es6-promise").polyfill();

module.exports = {
  entry: {
    main: ["./stylesheets/main.scss", "./javascript/main.js"],
    print: ["./stylesheets/print.scss"],
    // this also creates an (unneeded, unused, noop) print.js
    // TOOD: fix with webpack-fix-style-only-entries or similar?
  },
  module: {
    loaders: [
      // more config: https://webpack.github.io/docs/stylesheets.html
      {
        test: /\.scss/,
        loader: ExtractTextPlugin.extract(
          "style-loader",
          "css-loader?minimize&-autoprefixer!sass-loader"
        ),
      },
    ],
  },
  resolve: {
    extensions: ["", ".js", ".jsx"],
  },
  output: {
    path: path.join(__dirname, "./static"),
    filename: "[name].js",
  },
  plugins: [
    new ExtractTextPlugin("[name].css"),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"development"',
    }),
  ],
};
