import { ipcMain, IpcMainEvent } from "electron";
import logger from "../logger";
import Config from "./Config";
import FFmpeg from "./FFmpeg";
import colors from "colors";
import fs from "../fs";
import { scanMusic } from "../utils";

interface IpcMainEventObject {
  name: string;
  channel: string;
  handled: boolean;
  once: boolean;
  action: (event: IpcMainEvent, ...argv: any[]) => any;
}

class IPCMain {
  events: IpcMainEventObject[];
  ffmpeg: FFmpeg;
  config: Config;

  constructor(ffmpeg: FFmpeg, config: Config) {
    logger.log("Instantiating IpcMain module");
    this.ffmpeg = ffmpeg;
    this.config = config;

    this.events = [
      {
        name: "Get Config",
        channel: "cismu:main:get->config",
        handled: false,
        once: false,
        action: (event: IpcMainEvent, ...argv: any[]) => {
          event.sender.send("cismu:renderer:get->config", config.config);
        },
      },
      {
        name: "Find Songs",
        channel: "cismu:main:find->songs",
        handled: false,
        once: false,
        action: async (event: IpcMainEvent, ...argv: any[]) => {
          const musicPaths = scanMusic();
          const musics = [];

          for (let i = 0; i < musicPaths.length; i++) {
            const tmpFormat = await this.ffmpeg.convertFile(musicPaths[i]);
            const metadata = await this.ffmpeg.getMetadata(tmpFormat);
            musics.push(metadata);
          }

          event.sender.send("cismu:renderer:find->songs", musics);
        },
      },
    ];
  }

  async init() {
    logger.log("Registering Events...");
    const initTime = new Date().getTime();

    for (let x = 0; x < this.events.length; x++) {
      const event = this.events[x];

      if (event.handled) {
        if (event.once) {
          ipcMain.handleOnce(event.channel, event.action);
        } else {
          ipcMain.handle(event.channel, event.action);
        }
      } else {
        if (event.once) {
          ipcMain.once(event.channel, event.action);
        } else {
          ipcMain.on(event.channel, event.action);
        }
      }

      logger.log(`${colors.blue(event.name)} successfully registered`);
    }

    const endTime = (new Date().getTime() - initTime) / 1000;

    logger.log(`The initialization of the IpcMain module has been successfully completed in ${endTime}ms`);
  }
}

export default IPCMain;

// {
//   name: "Set User Music",
//   channel: "cismu:main:get->user-music",
//   handled: false,
//   once: false,
//   action: (event: IpcMainEvent, ...argv: any[]) => {},
// },
// {
//   name: "Get Config",
//   channel: "cismu:main:get->settings",
//   handled: false,
//   once: false,
//   action: (event: IpcMainEvent, ...argv: any[]) => {},
// },
// {
//   name: "Get Music",
//   channel: "cismu:main:get->music",
//   handled: false,
//   once: false,
//   action: (event: IpcMainEvent, ...argv: any[]) => {},
// },
// {
//   name: "Get User Data",
//   channel: "cismu:main:get->user-data",
//   handled: false,
//   once: false,
//   action: (event: IpcMainEvent, ...argv: any[]) => {},
// },
// {
//   name: "Get Users",
//   channel: "cismu:main:get->users",
//   handled: false,
//   once: false,
//   action: (event: IpcMainEvent, ...argv: any[]) => {},
// },
