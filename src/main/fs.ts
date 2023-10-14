import child_process from "child_process";
import fs from "fs-extra";
import util from "util";

import { WritableData } from "../types/main";
import { getTempPath } from "./utils";
import logger from "./logger";

interface ActivePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
  modify: boolean;
}

interface PermissionResult {
  user: string;
  permission: ActivePermissions;
}

function mkdirsSyncArray(paths: string[]) {
  for (let i = 0; i < paths.length; i++) {
    try {
      fs.mkdirsSync(paths[i]);
    } catch (error) {
      logger.error(error);
    }
  }
}

async function getPermissions(path: string): Promise<PermissionResult> {
  try {
    const exec = util.promisify(child_process.exec);

    const { stdout, stderr } = await exec(`icacls "${path}"`);

    if (stderr) {
      logger.error(`Error en stderr de icacls: ${stderr}`);
      throw new Error(stderr);
    }

    // Analyzes the output of icacls
    const lines = stdout.split("\n");
    const permissions: Record<string, string[]> = {};

    for (const line of lines) {
      const match = line.match(/^\s*([^:]+):\s*(.*)$/);
      if (match) {
        const user = match[1].trim();
        const permission = match[2].trim();

        if (!permissions[user]) {
          permissions[user] = [];
        }

        // Analyze permissions in an array
        permissions[user] = permissions[user].concat(permission.split(/\s+/).filter(Boolean));
      }
    }

    // Filter the entries of the current user
    const currentUser = process.env.USERDOMAIN + "\\" + process.env.USERNAME;
    const currentUserPermissions = permissions[currentUser] || [];

    // Determine the active permissions for the current user
    const activePermissions: ActivePermissions = {
      read: currentUserPermissions.some((perm) => /(R|RX|M|F)/.test(perm)),
      write: currentUserPermissions.some((perm) => /(W|M|F)/.test(perm)),
      execute: currentUserPermissions.some((perm) => /(X|M|F)/.test(perm)),
      modify: currentUserPermissions.some((perm) => /(M|F)/.test(perm)),
    };

    return { user: currentUser, permission: activePermissions };
  } catch (error) {
    logger.error(`Error obtaining permissions: ${error.message}`);
    throw error;
  }
}

async function atomicWriteSync(
  output: string,
  data: WritableData,
  mode: number = 0o777,
  encoding: BufferEncoding = "utf-8"
) {
  const tmp = getTempPath();

  const fd = fs.openSync(tmp, "w", mode);

  if (ArrayBuffer.isView(data) || Buffer.isBuffer(data)) {
    // If the data is an ArrayBufferView, it writes it as an ArrayBufferView.
    fs.writeSync(fd, data, 0, data.byteLength, 0);
  } else if (this.isPrimitive(data)) {
    // If the data are primitive, it writes them with the encoding specified in the options
    fs.writeSync(fd, String(data), null, encoding);
  } else {
    // If the data is not compatible, it throws an error
    throw new Error(
      "The data provided is not supported. Only ArrayBufferView and primitive data are supported."
    );
  }

  fs.closeSync(fd);

  fs.renameSync(tmp, output);
}

function isPrimitive(data: any): boolean {
  return (typeof data !== "object" && typeof data !== "function") || data === null;
}

export default {
  ...fs,
  mkdirsSyncArray,
  getPermissions,
  isPrimitive,
  atomicWriteSync,
};
