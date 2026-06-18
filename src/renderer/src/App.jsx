import React, { useState, useEffect } from 'react'
import CreateForm from './components/CreateForm.jsx'
import ContainerList from './components/ContainerList.jsx'

function App() {
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchContainers = async () => {
    try {
      const list = await window.dockerAPI.listContainers()
      setContainers(list)
    } catch (e) {
      console.error('Failed to fetch containers:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContainers()
  }, [])

  const handleCreate = async (data) => {
    try {
      await window.dockerAPI.createContainer(data)
      await fetchContainers()
    } catch (e) {
      console.error('Failed to create container:', e)
    }
  }

  const handleToggle = async (id, currentStatus) => {
    try {
      if (currentStatus === 'running') {
        await window.dockerAPI.stopContainer(id)
      } else {
        await window.dockerAPI.startContainer(id)
      }
      await fetchContainers()
    } catch (e) {
      console.error('Failed to toggle container:', e)
    }
  }

  const handleRemove = async (id) => {
    try {
      await window.dockerAPI.removeContainer(id)
      await fetchContainers()
    } catch (e) {
      console.error('Failed to remove container:', e)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐳 Docker 沙盒管理器</h1>
        <span className="subtitle">轻量级本地容器管理工具</span>
      </header>
      <div className="app-main">
        <aside className="sidebar">
          <CreateForm onCreate={handleCreate} />
        </aside>
        <section className="content">
          <div className="content-header">
            <h2>运行中的容器</h2>
            <span className="count-badge">{containers.length} 个</span>
          </div>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <ContainerList
              containers={containers}
              onToggle={handleToggle}
              onRemove={handleRemove}
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default App
