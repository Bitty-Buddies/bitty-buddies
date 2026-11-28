const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('shop', {
  state: () => ipcRenderer.invoke('shop:state'),
  buy: id => ipcRenderer.invoke('shop:buy', id),
  name: (id, name) => ipcRenderer.invoke('shop:name', { id, name }),
  spawn: id => ipcRenderer.invoke('shop:spawn', id),
  hats: hat => ipcRenderer.invoke('shop:hats', hat),
  open: what => ipcRenderer.invoke('shop:open', String(what)),
  set: (key, value) => ipcRenderer.invoke('centre:set', { key: String(key), value }),
  play: what => ipcRenderer.invoke('centre:play', String(what)),
  thing: (uid, action) => ipcRenderer.invoke('centre:thing', { uid: Number(uid), action: String(action) }),
  clear: kind => ipcRenderer.invoke('centre:clear', String(kind)),
  act: what => ipcRenderer.invoke('centre:do', String(what)),
  onUpdate: fn => ipcRenderer.on('shop:update', (_e, s) => fn(s)),
  onTab: fn => ipcRenderer.on('shop:tab', (_e, t) => fn(t))
});
