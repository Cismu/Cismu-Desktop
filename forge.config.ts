import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      unpackDir: ".webpack/bins",
    },
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ["darwin"]), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            name: "main_window",
            html: "./src/windows/main_window/index.html",
            js: "./src/windows/main_window/renderer.ts",
            preload: {
              js: "./src/windows/main_window/preload.ts",
            },
          },
          {
            name: "mini_player",
            html: "./src/windows/mini_player/index.html",
            js: "./src/windows/mini_player/renderer.ts",
            preload: {
              js: "./src/windows/mini_player/preload.ts",
            },
          },
          {
            name: "setup_window",
            html: "./src/windows/setup_window/index.html",
            js: "./src/windows/setup_window/renderer.ts",
            preload: {
              js: "./src/windows/setup_window/preload.ts",
            },
          },
        ],
      },
    }),
  ],
};

export default config;
