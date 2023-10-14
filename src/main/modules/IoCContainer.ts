import { IModuleTypes, TModuleName, TModuleTypes } from "../../types/main";

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

  static getInstance(): IoCContainer {
    if (!this.instance) {
      this.instance = new IoCContainer();
    }

    return this.instance;
  }
}

export default IoCContainer;
