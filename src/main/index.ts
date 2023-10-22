// Libraries
import { app } from "electron";
import { release } from "os";

// Imports
import IoCContainer from "./modules/IoCContainer";
import { bootstrap } from "./bootstrap";
import { Warnings } from "./errors";
import logger from "./logger";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Check whether the electron files are locked and, if so, whether another instance is already open.
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Useful constants
const isWindows = process.platform === "win32";
const isDevelopment = process.env.NODE_ENV === "development";

if (isDevelopment) {
  logger.setScale("DEBUG");
}

// If you do not set this you may have problems with notifications in Windows 10
// See more here: https://learn.microsoft.com/en-us/windows/configuration/find-the-application-user-model-id-of-an-installed-app
if (isWindows) app.setAppUserModelId(app.getName());

const args = parseCLIArgs();

// Disable Hardware Acceleration
if ((release().startsWith("6.1") && isWindows) || !args["hardware-acceleration"]) {
  app.disableHardwareAcceleration();
  logger.warn(Warnings["HWAccDisabled"]);
}

// Start the application internal's modules
const ioCContainer = IoCContainer.getInstance();
ioCContainer.run();

// Start the application with the context of the modules
bootstrap();

function parseCLIArgs() {
  return {
    "hardware-acceleration": !process.argv.includes("--disable-hardware-acceleration"),
    "repair-restart": process.argv.includes("--repair-restart"),
  };
}
