import { Rectangle } from "electron";
import Config from "../main/modules/Config";
import Database from "../main/modules/Database";
import FFmpeg from "../main/modules/FFmpeg";
import IPCMain from "../main/modules/IPCMain";
import Storage from "../main/modules/Storage";

export type WritableData = number | string | boolean | null | undefined | symbol | NodeJS.ArrayBufferView;

export interface IKeyboardShortcuts {
  accelerator: string;
  action: string;
}

export interface IStartup {
  auto_startup: boolean;
  start_minimized: boolean;
  minimize_in_tray: boolean;
}

export interface IConfig {
  version: string;
  theme: "light" | "dark" | "auto" | "custom";
  desktop_notifications: boolean;
  keyboard_shortcuts: IKeyboardShortcuts[];
  hardware_acceleration: boolean;
  bounds: Rectangle;
  language: string;
  developer_mode: boolean;
  startup: IStartup;
}

export type TFormatsSoported = "flac" | "mp3" | "ogg" | "wav" | "aac" | "opus";

export interface FFprobeID3 {
  title: string | null;
  album: string | null;
  artist: string | string[] | null;
  track_num: number | null;
  genre: string | null;
  date: string | null;
  picture: string | null;
}

export interface FFprobeData {
  id3: FFprobeID3;
  format: {
    filename: string;
    format_name: string;
    format_long_name: string;
    nb_streams: number;
    duration: number;
    start_time: number;
    bit_rate: number;
    probe_score: number;
    channels: number;
    channel_layout: string;
    codec_type: string;
    sample_rate: number;
  };
}

export interface IModuleTypes {
  config: Config;
  ipcmain: IPCMain;
  ffmpeg: FFmpeg;
  storage: Storage;
  database: Database;
}

export type TModuleName = keyof IModuleTypes;
export type TModuleTypes = IModuleTypes[TModuleName];
