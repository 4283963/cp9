import React from 'react'
import ContainerCard from './ContainerCard.jsx'

function ContainerList({ containers, onToggle, onRemove }) {
  if (containers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <p>暂无容器</p>
        <p className="empty-hint">在左侧填写信息创建你的第一个容器</p>
      </div>
    )
  }

  return (
    <div className="container-grid">
      {containers.map((container) => (
        <ContainerCard
          key={container.id}
          container={container}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

export default ContainerList
