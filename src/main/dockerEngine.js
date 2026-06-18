import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

export class DockerEngine {
  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'data')
    this.dataFile = path.join(this.dataDir, 'containers.json')
    this.containers = []
    this._ensureDataFile()
    this._loadContainers()
  }

  _ensureDataFile() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
    if (!fs.existsSync(this.dataFile)) {
      fs.writeFileSync(this.dataFile, JSON.stringify([], null, 2))
    }
  }

  _loadContainers() {
    try {
      const data = fs.readFileSync(this.dataFile, 'utf-8')
      this.containers = JSON.parse(data)
    } catch (e) {
      this.containers = []
    }
  }

  _saveContainers() {
    fs.writeFileSync(this.dataFile, JSON.stringify(this.containers, null, 2))
  }

  _generateId() {
    return 'ctn_' + Math.random().toString(36).substring(2, 10)
  }

  listContainers() {
    return [...this.containers]
  }

  createContainer({ image, portMapping, name }) {
    const id = this._generateId()
    const container = {
      id,
      name: name || `${image.split(':')[0]}_${id.substring(4, 8)}`,
      image,
      portMapping: portMapping || '',
      status: 'running',
      createdAt: new Date().toISOString()
    }
    this.containers.unshift(container)
    this._saveContainers()
    return container
  }

  startContainer(id) {
    const container = this.containers.find(c => c.id === id)
    if (container) {
      container.status = 'running'
      this._saveContainers()
      return container
    }
    return null
  }

  stopContainer(id) {
    const container = this.containers.find(c => c.id === id)
    if (container) {
      container.status = 'stopped'
      this._saveContainers()
      return container
    }
    return null
  }

  removeContainer(id) {
    const index = this.containers.findIndex(c => c.id === id)
    if (index !== -1) {
      const removed = this.containers.splice(index, 1)[0]
      this._saveContainers()
      return removed
    }
    return null
  }
}
