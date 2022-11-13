const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: `app.js`,
    path: path.resolve(__dirname, "build"),
  },
  module: {
    rules: [
      // {
      //   test: [/\.scss$/i],
      //   use: [
      //     MiniCssExtractPlugin.loader,
      //     "css-loader",
      //     "postcss-loader",
      //     "sass-loader",
      //   ],
      // },
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
  ],
  resolve: { extensions: [".ts", ".tsx", ".js", ".json"] },
};
