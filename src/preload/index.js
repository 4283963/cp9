import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('dockerAPI', {
  listContainers: () => ipcRenderer.invoke('container:list'),
  createContainer: (data) => ipcRenderer.invoke('container:create', data),
  startContainer: (id) => ipcRenderer.invoke('container:start', id),
  stopContainer: (id) => ipcRenderer.invoke('container:stop', id),
  removeContainer: (id) => ipcRenderer.invoke('container:remove', id)
})
