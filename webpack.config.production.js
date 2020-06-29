const webpack = require("webpack");

var config = require("./webpack.config.js");

// remove the development configuration
config.plugins.pop();

config.plugins.push(new webpack.DefinePlugin({
  "process.env.NODE_ENV": '"production"'
}));

module.exports = config;
