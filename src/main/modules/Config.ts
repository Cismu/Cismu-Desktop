import { JTDParser, SchemaObject } from "ajv/dist/jtd";
import { screen, app, Rectangle } from "electron";
import Jtd from "ajv/dist/jtd";

import { IConfig } from "../../types/main";
import { paths } from "../constants";
import { cloneDeep } from "../utils";
import { abort } from "../startup";
import logger from "../logger";
import fs from "../fs";

import { CismuInvalidConfig, CismuOperatingSystemNotSupported } from "../errors";

class Config {
  // Public:
  parserSchema: JTDParser<IConfig>;
  serializeSchema: (schema: SchemaObject) => string;

  // Private:
  private cfg: IConfig;
  private defaultCfg: IConfig;
  private jtd: Jtd;
  private lastModified: number;
  private cfgPath: string;

  constructor() {
    logger.log("Instantiating Config module");

    this.jtd = new Jtd();
    const schema = getSchema();

    this.parserSchema = this.jtd.compileParser<IConfig>(schema);
    this.serializeSchema = this.jtd.compileSerializer<typeof schema>(schema);

    this.defaultCfg = {
      version: "1.0.0",
      theme: "dark",
      desktop_notifications: true,
      keyboard_shortcuts: [
        {
          accelerator: "CTRL+Z",
          action: "1",
        },
      ],
      hardware_acceleration: true,
      language: app.getPreferredSystemLanguages()[0],
      developer_mode: false,
      bounds: {
        x: 0,
        y: 0,
        width: 1024,
        height: 768,
      },
      startup: {
        auto_startup: true,
        start_minimized: true,
        minimize_in_tray: true,
      },
    };

    this.cfg = cloneDeep(this.defaultCfg);
    this.cfgPath = paths.files.globalSettings;
  }

  /**
   * Validate config
   */
  validate() {
    if (app.isReady()) {
      this._validate();
    } else {
      app.once("ready", () => {
        logger.log("Event Ready from: Config Module");
        this._validate();
      });
    }
  }

  /**
   * Initializes the Config module.
   *
   * @return {Promise<void>} - A promise that resolves when the initialization is complete.
   */
  async init() {
    logger.log("Initialization of the Config module has been successfully completed");
    this.lastModified = this._getLastModified();

    try {
      const data: Buffer = await new Promise((resolve, reject) => {
        fs.readFile(paths.files.globalSettings, (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      });

      const config = data.toString("utf-8");

      try {
        const cfgParsed = this.parserSchema(config);

        if (!cfgParsed) {
          throw new CismuInvalidConfig();
        } else {
          this.cfg = cfgParsed;
        }
      } catch (error) {
        logger.error(error);
        this.cfg = cloneDeep(this.defaultCfg);
        this.save();
      }

      this.save();
    } catch (error) {
      logger.error(error);
      this.cfg = cloneDeep(this.defaultCfg);
    }
  }

  /**
   * Saves the configuration.
   *
   * @return {Promise<void>} - Returns a promise that resolves when the configuration is saved successfully.
   */
  async save() {
    try {
      if (this.lastModified && this.lastModified !== this._getLastModified()) {
        logger.warn("Not saving settings, it has been externally modified.");
        return;
      }

      const data = this.serializeSchema(this.cfg);
      fs.atomicWriteSync(this.cfgPath, data, 0o777);

      this.lastModified = this._getLastModified();
    } catch (error) {
      logger.error("An error occurred while saving the configuration", error);
    }
  }

  get<Key extends keyof IConfig>(key: Key): IConfig[Key];
  get<Key extends keyof IConfig>(key: Key, defaultValue: IConfig[Key]): IConfig[Key];
  get<Key extends keyof IConfig>(key: Key, defaultValue?: IConfig[Key]): IConfig[Key] | undefined {
    return key in this.cfg ? this.cfg[key] : defaultValue;
  }

  set<Key extends keyof IConfig>(key: Key | Partial<IConfig>, value?: IConfig[Key] | unknown): void {
    if (value) {
      if (typeof key === "object") {
        const object = key;
        for (const [key, value] of Object.entries(object)) {
          this.cfg[key as Key] = value as IConfig[Key];
        }
      } else {
        this.cfg[key] = value as IConfig[Key];
      }
    }
  }

  reset<Key extends keyof IConfig>(key: Key): void {
    this.cfg[key] = this.defaultCfg[key];
    this.save();
  }

  /**
   * Get the config object.
   *
   * @return {IConfig} The config object.
   */
  get config(): IConfig {
    return { ...this.cfg };
  }

  /**
   * Checks the bounds of the given rectangle.
   *
   * @param {Rectangle} bounds - The rectangle to check. If not provided, the default bounds will be used.
   * @return {Rectangle} - The checked bounds. If the rectangle is offscreen, the default bounds will be returned.
   */
  checkBounds(bounds?: Rectangle): Rectangle {
    try {
      if (bounds === undefined) {
        bounds = cloneDeep(this.defaultCfg.bounds);
      }
      // check if the browser window is offscreen
      const display = screen.getDisplayNearestPoint({
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
      }).workArea;

      const onScreen =
        bounds.x >= display.x &&
        bounds.x + bounds.width <= display.x + display.width &&
        bounds.y >= display.y &&
        bounds.y + bounds.height <= display.y + display.height;

      if (!onScreen) {
        return {
          width: this.defaultCfg.bounds.width,
          height: this.defaultCfg.bounds.height,
          x: display.width / 2 - this.defaultCfg.bounds.width / 2,
          y: display.height / 2 - this.defaultCfg.bounds.height / 2,
        };
      }

      return bounds;
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * Validates the configuration and handles any errors that occur.
   *
   * @private
   * @return {void}
   */
  private _validate() {
    try {
      this.cfg.bounds = this.checkBounds(this.cfg.bounds);
      this.save();
    } catch (error) {
      logger.error(error);
      this.cfg = cloneDeep(this.defaultCfg);
    }
  }

  /**
   * A function to get the last modified time of a file.
   *
   * @return {number} The last modified time of the file.
   */
  private _getLastModified() {
    try {
      return fs.statSync(paths.files.globalSettings).mtime.getTime();
    } catch (e) {
      return 0;
    }
  }
}

const Windows = {
  properties: {
    version: { type: "string" },
    theme: { type: "string" },
    desktop_notifications: { type: "boolean" },
    keyboard_shortcuts: {
      elements: {
        properties: {
          accelerator: { type: "string" },
          action: { type: "string" },
        },
      },
    },
    hardware_acceleration: { type: "boolean" },
    language: { type: "string" },
    developer_mode: { type: "boolean" },
    bounds: {
      properties: {
        x: { type: "int32" },
        y: { type: "int32" },
        width: { type: "int32" },
        height: { type: "int32" },
      },
      additionalProperties: false,
    },
    startup: {
      properties: {
        auto_startup: { type: "boolean" },
        start_minimized: { type: "boolean" },
        minimize_in_tray: { type: "boolean" },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

function getSchema() {
  switch (process.platform) {
    case "win32":
      return Windows;
    case "linux":
      return Windows;
    case "darwin":
      return Windows;
    default:
      logger.error("The current operating system does not support the config module");
      abort(new CismuOperatingSystemNotSupported());
      break;
  }
}

export default Config;
