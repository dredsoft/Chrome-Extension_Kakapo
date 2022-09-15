import path from "path";
import webpack from "webpack";

const DEBUG = !process.argv.includes("release");
const VERBOSE = process.argv.includes("verbose");
const WATCH = global.WATCH === undefined ? false : global.WATCH;

if (!DEBUG) {
  process.env.NODE_ENV = "production";
}

export default {
  entry: {
    index: "./src/scripts/index",
    background: "./src/scripts/background"
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "../build"),
    publicPath: "/"
  },
  cache: DEBUG,
  debug: DEBUG,
  devtool: DEBUG ? "#eval" : false,
  plugins: [
    new webpack.IgnorePlugin(/react\/lib\/ReactContext/),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": DEBUG ? "'development'" : "'production'",
      __DEV__: DEBUG
    }),
    ...(!DEBUG ? [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: VERBOSE
        }
      }),
      new webpack.optimize.AggressiveMergingPlugin()
    ] : []),
    ...(WATCH ? [
      new webpack.NoErrorsPlugin()
    ] : [])
  ],
  module: {
    loaders: [
      {
        test: /\.(js|jsx)?$/,
        include: [
          path.resolve(__dirname, "../src")
        ],
        loader: "babel-loader"
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader!postcss-loader"
      }
    ]
  },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
  },
  postcss: function plugins() {
    return [
      require("postcss-import")({
        onImport: files => files.forEach(this.addDependency)
      }),
      require("postcss-nested")(),
      require("postcss-cssnext")()
    ];
  },

  stats: {
    colors: true,
    reasons: DEBUG,
    hash: VERBOSE,
    version: VERBOSE,
    timings: true,
    chunks: VERBOSE,
    chunkModules: VERBOSE,
    cached: VERBOSE,
    cachedAssets: VERBOSE
  }
};
