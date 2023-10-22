import Database from "./Database";
import IPCMain from "./IPCMain";
import Storage from "./Storage";
import FFmpeg from "./FFmpeg";
import Config from "./Config";

class IoCContainer {
  private static instance: IoCContainer;
  private modules: Map<TModuleName, TModuleTypes>;

  private constructor() {
    this.modules = new Map<TModuleName, TModuleTypes>();
  }

  register<K extends TModuleName>(key: K, instance: IModuleTypes[K]): void {
    this.modules.set(key, instance);
  }

  resolve<K extends TModuleName>(moduleName: K): IModuleTypes[K] | undefined {
    return this.modules.get(moduleName) as IModuleTypes[K] | undefined;
  }

  run() {
    const config = new Config();
    this.register("config", config);

    const database = new Database();
    this.register("database", database);

    const storage = new Storage(database);
    this.register("storage", storage);

    const ffmpeg = new FFmpeg(storage);
    this.register("ffmpeg", ffmpeg);

    const ipcMain = new IPCMain(ffmpeg, config);
    this.register("ipcmain", ipcMain);
  }

  static getInstance(): IoCContainer {
    if (!this.instance) {
      this.instance = new IoCContainer();
    }

    return this.instance;
  }
}

export default IoCContainer;

// Interface with the application's internal modules
interface IModuleTypes {
  config: Config;
  ipcmain: IPCMain;
  ffmpeg: FFmpeg;
  storage: Storage;
  database: Database;
}

type TModuleName = keyof IModuleTypes;
type TModuleTypes = IModuleTypes[TModuleName];
