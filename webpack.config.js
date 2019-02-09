const production = process.env.NODE_ENV === "production";
const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');

let config = {
  mode: "development",
  devtool: "inline-source-map", //dont use sourcemap on production mode
  entry: ["pixi.js", "./src/main.ts"],
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "game.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  mode: production ? "production" : "development"
};

if(production) {
  delete config["devtool"];
  config.optimization = {
    minimizer: [new TerserPlugin()]
  };
}

module.exports = config;