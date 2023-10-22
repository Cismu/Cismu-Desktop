import { contextBridge, ipcRenderer } from "electron";
import { ICismuAPI } from "../../types/globals";

const API: ICismuAPI = {
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },

  once: (channel, callback) => {
    ipcRenderer.once(channel, callback);
  },

  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args);
  },

  invoke(channel, ...args) {
    return ipcRenderer.invoke(channel, ...args);
  },
};

contextBridge.exposeInMainWorld("api", API);
