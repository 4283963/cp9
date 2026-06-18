import React from 'react'

function ContainerCard({ container, onToggle, onRemove }) {
  const isRunning = container.status === 'running'

  const formatDate = (isoString) => {
    const d = new Date(isoString)
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`container-card ${isRunning ? 'running' : 'stopped'}`}>
      <div className="card-header">
        <div className="card-title">
          <span className="status-dot"></span>
          <h3>{container.name}</h3>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={isRunning}
            onChange={() => onToggle(container.id, container.status)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="info-label">镜像</span>
          <span className="info-value image-tag">{container.image}</span>
        </div>
        {container.portMapping && (
          <div className="info-row">
            <span className="info-label">端口</span>
            <span className="info-value port">{container.portMapping}</span>
          </div>
        )}
        <div className="info-row">
          <span className="info-label">ID</span>
          <span className="info-value mono">{container.id}</span>
        </div>
        <div className="info-row">
          <span className="info-label">创建时间</span>
          <span className="info-value">{formatDate(container.createdAt)}</span>
        </div>
      </div>

      <div className="card-footer">
        <span className={`status-badge ${isRunning ? 'status-running' : 'status-stopped'}`}>
          {isRunning ? '运行中' : '已停止'}
        </span>
        <button
          className="btn-remove"
          onClick={() => onRemove(container.id)}
          title="删除容器"
        >
          🗑️ 删除
        </button>
      </div>
    </div>
  )
}

export default ContainerCard
