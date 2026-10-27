// SamityPro Desktop Secure Preload Script
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  platform: process.platform,
  isDesktop: true,
  version: '2.0.0',
  printDirect: (options) => ipcRenderer.invoke('print-direct', options),
});
