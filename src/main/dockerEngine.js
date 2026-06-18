import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

export class DockerEngine {
  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'data')
    this.dataFile = path.join(this.dataDir, 'containers.json')
    this.containers = []
    this._locks = new Map()
    this._ensureDataFile()
    this._loadContainers()
  }

  async _acquireLock(id) {
    while (this._locks.get(id)) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    this._locks.set(id, true)
  }

  _releaseLock(id) {
    this._locks.delete(id)
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

  _extractHostPort(portMapping) {
    if (!portMapping) return null
    const parts = portMapping.split(':')
    if (parts.length >= 1 && parts[0]) {
      const port = parseInt(parts[0], 10)
      return isNaN(port) ? null : port
    }
    return null
  }

  _checkPortConflict(hostPort, excludeId = null) {
    if (!hostPort) return null
    for (const c of this.containers) {
      if (excludeId && c.id === excludeId) continue
      if (c.status !== 'running') continue
      const existingPort = this._extractHostPort(c.portMapping)
      if (existingPort === hostPort) {
        return c
      }
    }
    return null
  }

  createContainer({ image, portMapping, name }) {
    const hostPort = this._extractHostPort(portMapping)
    const conflictingContainer = this._checkPortConflict(hostPort)
    if (conflictingContainer) {
      const err = new Error(`端口冲突：${hostPort} 端口已被容器 ${conflictingContainer.name} 占用，请更换端口！`)
      err.code = 'PORT_CONFLICT'
      err.port = hostPort
      err.conflictingContainerName = conflictingContainer.name
      throw err
    }

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

  async startContainer(id) {
    await this._acquireLock(id)
    try {
      const container = this.containers.find(c => c.id === id)
      if (!container) return null
      if (container.status === 'running') return container
      container.status = 'running'
      this._saveContainers()
      return container
    } finally {
      this._releaseLock(id)
    }
  }

  async stopContainer(id) {
    await this._acquireLock(id)
    try {
      const container = this.containers.find(c => c.id === id)
      if (!container) return null
      if (container.status === 'stopped') return container
      container.status = 'stopped'
      this._saveContainers()
      return container
    } finally {
      this._releaseLock(id)
    }
  }

  async removeContainer(id) {
    await this._acquireLock(id)
    try {
      const index = this.containers.findIndex(c => c.id === id)
      if (index !== -1) {
        const removed = this.containers.splice(index, 1)[0]
        this._saveContainers()
        return removed
      }
      return null
    } finally {
      this._releaseLock(id)
    }
  }
}
