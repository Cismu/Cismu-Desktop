import { app } from "electron";
import { homedir } from "os";
import { join } from "path";

const userDataPath = getUserDataPath();

app.setPath("userData", userDataPath);

// Folders
const root = app.getPath("userData");
const music = app.getPath("music");
const logs = app.getPath("logs");
const rootCache = join(root, "Cache");
const userData = join(app.getPath("userData"), "UserData");
const cache = join(userData, "Cache");
const media = join(userData, "Media");
const profiles = join(userData, "Profiles");
const databases = join(profiles, "%USERNAME%", "Databases");

// Files
const globalSettings = join(root, "settings.global");
const globalDatabase = join(root, "cismu.db");
const settings = join(profiles, "%USERNAME%", "settings");
const database = join(databases, "cismu.db");
const firstStart = join(root, ".firststart");

const osLocale = app.getPreferredSystemLanguages()?.[0] || "es-US";

interface IExtension {
  name: string;
  mime: string;
  ext: string | string[];
  native: boolean;
}

export const extensions: IExtension[] = [
  {
    name: "Free Lossless Audio Codec",
    mime: "audio/x-flac",
    ext: ["flac", "mflac"],
    native: true,
  },
  {
    name: "MPEG Audio Layer III",
    mime: "audio/mp3",
    ext: "mp3",
    native: true,
  },
  {
    name: "Ogg",
    mime: "audio/ogg",
    ext: ["opus", "ogg"],
    native: true,
  },
  {
    name: "Waveform Audio File Format",
    mime: "audio/wav",
    ext: ["wav", "wave1"],
    native: true,
  },
  {
    name: "Audio Interchange File Format",
    mime: "audio/aiff",
    ext: "aiff",
    native: false,
  },
  {
    name: "Au",
    mime: "audio/basic",
    ext: ["au", "sdn"],
    native: false,
  },
  {
    name: "Windows Media Audio",
    mime: "audio/x-ms-wma",
    ext: "wma",
    native: false,
  },
];

export const product = {
  version: "1.0.0",
  name: "Cismu",
  long_name: "Cismu Player",
  machine_name: "cismu-player",
  short_machine_name: "cismu",
  description: "Cismu: The customizable and versatile music player.",
  uuids: {
    namespace: "52340235-645f-4661-902b-b175fc399644",
    seed: "Cismu Player Desktop",
    uuid: "0d46bbc9-c453-5f6f-a6e9-dd49380bef3f",
    SHA512: "27b2d837372f539b21069190d59a3536526a4187916f072956b3a5c842b400a5", // Cismu\Player\Version\UUID
  },
};

export const paths = {
  folders: {
    root,
    logs,
    rootCache,
    userData,
    cache,
    media,
    profiles,
    databases,
    music,
  },
  files: {
    globalSettings,
    globalDatabase,
    settings,
    database,
    firstStart,
  },
  osLocale,
};

export default {
  paths,
};

export function getUserDataPath(): string {
  let appDataPath: string | undefined;

  // 1. Support portable mode
  const portablePath = process.env["CISMU_PORTABLE"];

  if (portablePath) {
    return join(portablePath, "user-data");
  }

  // 2. Support global CISMU_PORTABLE_APPDATA environment variable
  appDataPath = process.env["CISMU_APPDATA"];

  if (appDataPath) {
    return join(appDataPath, app.name);
  }

  // 3. Support explicit --user-data-dir
  const cliPathIndex = process.argv.indexOf("--user-data-dir");

  if (cliPathIndex !== -1 && process.argv.length > cliPathIndex + 1) {
    return process.argv[cliPathIndex + 1];
  }

  // 4. Otherwise check per platform
  switch (process.platform) {
    case "win32":
      appDataPath = process.env["APPDATA"];

      if (!appDataPath) {
        const userProfile = process.env["USERPROFILE"];

        if (typeof userProfile !== "string") {
          throw new Error("Windows: Unexpected undefined %USERPROFILE% environment variable");
        }

        appDataPath = join(userProfile, "AppData", "Roaming");
      }
      break;
    case "darwin":
      appDataPath = join(homedir(), "Library", "Application Support");
      break;
    case "linux":
      appDataPath = process.env["XDG_CONFIG_HOME"] || join(homedir(), ".config");
      break;
    default:
      throw new Error("Platform not supported");
  }

  return join(appDataPath, app.name);
}
