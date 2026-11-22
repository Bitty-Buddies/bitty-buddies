const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('shop', {
  state: () => ipcRenderer.invoke('shop:state'),
  buy: id => ipcRenderer.invoke('shop:buy', id),
  name: (id, name) => ipcRenderer.invoke('shop:name', { id, name }),
  spawn: id => ipcRenderer.invoke('shop:spawn', id),
  hats: hat => ipcRenderer.invoke('shop:hats', hat),
  onUpdate: fn => ipcRenderer.on('shop:update', (_e, s) => fn(s)),
  onTab: fn => ipcRenderer.on('shop:tab', (_e, t) => fn(t))
});
