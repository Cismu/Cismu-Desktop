import { BrowserWindow, app, dialog } from "electron";
import { v4 as uuid } from "uuid";
import sudo from "sudo-prompt";
import path from "path";
import fs from "./fs";
import os from "os";

import { paths } from "./constants";
import logger from "./logger";

import {
  CismuError,
  CismuPermissionError,
  CismuSetupError,
  CismuPermissionNotGrantedError,
  CismuMissingFiles,
  CismuAccessError,
} from "./errors";

export function isFirstStart(): boolean {
  return !fs.existsSync(paths.files.firstStart);
}

export async function setup(): Promise<void> {
  if (!isFirstStart()) throw new CismuSetupError();

  try {
    const { folders, files } = paths;

    const defaultUser = Buffer.from("Default").toString("base64");
    fs.mkdirsSyncArray(Object.values(folders).map((path) => path.replace("%USERNAME%", defaultUser)));

    const userDbFile = files.database.replace("%USERNAME%", defaultUser);
    fs.writeFileSync(userDbFile, "\0");

    const userSettings = files.settings.replace("%USERNAME%", defaultUser);
    fs.writeFileSync(userSettings, "{}");

    fs.writeFileSync(files.globalSettings, "{}");
    fs.writeFileSync(paths.files.firstStart, "true");
  } catch (error) {
    if (error.code === "EPERM") {
      throw new CismuPermissionError(error);
    }

    throw new CismuSetupError(null, "Unknown error during configuration, try to run as administrator");
  }
}

export async function testing(): Promise<boolean> {
  try {
    logger.debug("Initiating start-up tests...");

    const folderPaths = [
      paths.folders.root,
      paths.folders.userData,
      paths.folders.profiles,
      paths.folders.media,
      paths.folders.cache,
      paths.folders.logs,
    ];

    const filesPaths = [paths.files.firstStart, paths.files.globalSettings];
    const allFiles = [...folderPaths, ...filesPaths];

    let foldersExists = true;
    for (let i = 0; i < folderPaths.length; i++) {
      foldersExists = foldersExists && fs.existsSync(folderPaths[i]);
    }

    let filesExists = true;
    for (let i = 0; i < filesPaths.length; i++) {
      filesExists = filesExists && fs.existsSync(filesPaths[i]);
    }

    if (!foldersExists || !filesExists) {
      throw new CismuMissingFiles();
    }

    try {
      const fullAccess = fs.constants.F_OK | fs.constants.X_OK | fs.constants.W_OK | fs.constants.R_OK;
      for (let i = 0; i < allFiles.length; i++) {
        fs.accessSync(allFiles[i], fullAccess);
      }
    } catch (error) {
      throw new CismuAccessError();
    }

    // Mucho Tiempo

    if (process.platform === "win32") {
      for (let i = 0; i < allFiles.length; i++) {
        const { permission } = await fs.getPermissions(allFiles[i]);
        const passed = permission.modify || (permission.execute && permission.read && permission.write);
        if (!passed) {
          throw new CismuAccessError();
        }
      }
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export async function repair(): Promise<boolean> {
  try {
    logger.debug("Initiating repair...");

    async function exec(command: string) {
      return await new Promise((resolve, reject) => {
        sudo.exec(command, { name: app.getName() }, function (error, stdout, stderr) {
          if (error || stderr) reject(error ?? stderr);
          resolve(stdout);
        });
      });
    }

    if (os.platform() === "win32") {
      const root = paths.folders.root;
      const command = `icacls ${root} /inheritance:d && icacls ${root} /inheritance:e && icacls ${root} /reset /t /c`;
      await exec(command);
    } else if (os.platform() === "linux" || os.platform() === "darwin") {
      const command = `chmod -R u+rwx "${paths.folders.root}`;
      await exec(command);
    }

    let userDataBackup = path.join(paths.folders.rootCache, uuid());
    if (fs.existsSync(paths.folders.userData)) {
      fs.moveSync(paths.folders.userData, userDataBackup);
    }

    if (fs.existsSync(paths.files.firstStart)) {
      fs.unlinkSync(paths.files.firstStart);
    }

    await setup();

    if (fs.existsSync(userDataBackup)) {
      fs.moveSync(userDataBackup, path.join(paths.folders.cache, uuid()));
    }

    logger.debug("Repair completed");

    return true;
  } catch (error) {
    if (error.message === "User did not grant permission.") {
      throw new CismuPermissionNotGrantedError();
    } else if (error.code === "EPERM") {
      throw new CismuPermissionError(error);
    }

    logger.error(error);

    return false;
  }
}

export async function reboot(options?: { addArgs?: string[]; removeArgs?: string[] }): Promise<void> {
  const args = process.argv.slice(1);

  if (options?.addArgs) {
    args.push(...options.addArgs);
  }

  if (options?.removeArgs) {
    for (const a of options.removeArgs) {
      const idx = args.indexOf(a);
      if (idx >= 0) {
        args.splice(idx, 1);
      }
    }
  }

  const quitListener = () => {
    app.relaunch({ args });
  };

  app.once("quit", quitListener);
  app.quit();
}

export async function abort(error: Error | CismuError): Promise<void> {
  await app.whenReady();

  let detail = error.message || error.stack;
  let message = "Unknown error at startup";
  let title = "A critical error occurred and the application needs to abort";

  if (error instanceof CismuError) {
    title = error.name;
    message = error.message;
    detail = error.description;
  }

  try {
    await dialog.showMessageBox(null, {
      type: "error",
      message: message,
      detail: detail,
      buttons: ["Close"],
      title: title,
    });
    close();
  } catch (error) {
    logger.error(error);
    close();
  }
}

export async function close(): Promise<void> {
  const windows = BrowserWindow.getAllWindows();

  await Promise.all(
    windows.map(async (window) => {
      if (window && !window.isDestroyed()) {
        let whenWindowClosed: Promise<void>;

        if (window.webContents && !window.webContents.isDestroyed()) {
          whenWindowClosed = new Promise((resolve) => window.once("closed", resolve));
        } else {
          whenWindowClosed = Promise.resolve();
        }

        window.destroy();
        await whenWindowClosed;
      }
    })
  );

  app.exit(0);
}
