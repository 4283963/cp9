import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DockerEngine } from './dockerEngine.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow
let dockerEngine

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    title: 'Docker 沙盒管理器',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

function setupIpc() {
  ipcMain.handle('container:list', () => {
    return dockerEngine.listContainers()
  })

  ipcMain.handle('container:create', (_event, data) => {
    const container = dockerEngine.createContainer(data)
    return container
  })

  ipcMain.handle('container:start', (_event, id) => {
    return dockerEngine.startContainer(id)
  })

  ipcMain.handle('container:stop', (_event, id) => {
    return dockerEngine.stopContainer(id)
  })

  ipcMain.handle('container:remove', (_event, id) => {
    return dockerEngine.removeContainer(id)
  })
}

app.whenReady().then(() => {
  dockerEngine = new DockerEngine()
  setupIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
