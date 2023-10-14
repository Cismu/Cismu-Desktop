import { app, BrowserWindow } from "electron";
import { release } from "os";
import "./constants";

import { CismuError, CismuStartupError, CismuRepairError } from "./errors";
import { abort, reboot, repair } from "./startup";
import { bootstrap } from "./bootstrap";
import { parseCLIArgs } from "./utils";
import logger from "./logger";

import IoCContainer from "./modules/IoCContainer";
import Database from "./modules/Database";
import Storage from "./modules/Storage";
import IPCMain from "./modules/IPCMain";
import Config from "./modules/Config";
import FFmpeg from "./modules/FFmpeg";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const isWindows = process.platform === "win32";
const isDevelopment = process.env.NODE_ENV === "development";

const args = parseCLIArgs();

// Disable Hardware Acceleration
if ((release().startsWith("6.1") && isWindows) || !args["hardware-acceleration"]) {
  app.disableHardwareAcceleration();
  logger.warn(
    "Hardware acceleration has been disabled, \
    for more information check https://support.cismu.org/hardware-acceleration"
  );
}

if (isWindows) app.setAppUserModelId(app.getName());

registerListeners(); // Global listeners

let mainWindow: BrowserWindow;

// Instance the internal modules
const iocContainer = IoCContainer.getInstance();

const config = new Config();
iocContainer.register("config", config);

const database = new Database();
iocContainer.register("database", database);

const storage = new Storage(database);
iocContainer.register("storage", storage);

const ffmpeg = new FFmpeg(storage);
iocContainer.register("ffmpeg", ffmpeg);

const ipcMain = new IPCMain(ffmpeg, config);
iocContainer.register("ipcmain", ipcMain);

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (isDevelopment) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
}

if (args["repair-restart"]) {
  repair()
    .then((repaired) => {
      if (repaired) {
        reboot({ removeArgs: ["--repair-restart"] });
      } else {
        abort(new CismuRepairError());
      }
    })
    .catch((error) => {
      logger.error(error);
      abort(new CismuRepairError());
    });
} else {
  bootstrap()
    .then(async () => {
      logger.log("Application started successfully, all modules were loaded successfully");

      if (app.isReady()) onReady();
      else app.once("ready", () => onReady());
    })
    .catch((error) => {
      logger.error("An error occurred at application startup");

      if (error instanceof CismuError) {
        logger.crit(error);
      } else {
        logger.crit(new CismuStartupError(error));
      }

      app.exit(1);
    });
}

function onReady() {
  createMainWindow();
}

/**
 * Registers event listeners for the application.
 */
function registerListeners() {
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  app.on("second-instance", () => {
    mainWindow?.focus();
  });
}
