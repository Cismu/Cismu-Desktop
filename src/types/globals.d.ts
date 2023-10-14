// import * as ReactDOM from "react-dom";
// import React from "react";

interface ICismuPluginAPI {
  // React: typeof React;
  // ReactDOM: typeof ReactDOM;
  CismuAPI: ICismuAPI;
}

type TRendererCallback = (event: Electron.IpcRendererEvent, ...args: any[]) => void;
export interface ICismuAPI {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
  once: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
}

declare global {
  interface Window {
    navigation: {
      canGoBack: boolean;
      canGoForward: boolean;
    };
    // player?: {
    //   audioElement?: HTMLAudioElement;
    //   audioContext?: AudioContext;
    //   audioElementSource?: MediaElementAudioSourceNode;
    // };
    api: ICismuAPI;
    // CismuPluginAPI: ICismuPluginAPI;
  }
}

export {};
