import { v4 as uuid } from "uuid";
import { globSync } from "glob";

import { extensions, paths } from "./constants";
import logger from "./logger";
import path from "path";
import fs from "./fs";

export function cloneDeep<T>(value: T): T {
  try {
    if (fs.isPrimitive(value)) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => cloneDeep(item)) as unknown as T;
    }

    if (typeof value === "object") {
      const clonedObj = {} as T;
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          clonedObj[key] = cloneDeep(value[key]);
        }
      }

      return clonedObj;
    }
  } catch (error) {
    logger.error("cloneDeep: Unhandled value type");
    logger.error(error);
  }
}

export function getTempPath() {
  return path.join(paths.folders.rootCache, uuid());
}

export function scanMusic() {
  let extens = "";

  extensions.map((extension) => {
    if (Array.isArray(extension.ext)) {
      extens = `${extens},${extension.ext.join(",")}`;
    } else {
      extens = `${extens},${extension.ext}`;
    }
  });

  const results = globSync(`**/*.{${extens}}`, {
    cwd: paths.folders.music,
    nodir: true,
    absolute: true,
  });

  return results;
}
