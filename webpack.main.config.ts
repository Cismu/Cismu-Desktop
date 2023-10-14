import type { Configuration } from "webpack";
import CopyPlugin from "copy-webpack-plugin";
import { rules } from "./webpack.rules";
import { resolve, join } from "path";
import { platform, arch } from "os";

const ext = process.platform === "win32" ? ".exe" : "";

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/index.ts",
  // Put your normal webpack config below here
  module: {
    rules,
  },
  externals: ["better-sqlite3"],
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: `./bins/${platform()}/${arch()}/ffmpeg${ext}`,
          to: resolve(join(__dirname, ".webpack/bins")),
        },
        {
          from: `./bins/${platform()}/${arch()}/ffprobe${ext}`,
          to: resolve(join(__dirname, ".webpack/bins")),
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
};
