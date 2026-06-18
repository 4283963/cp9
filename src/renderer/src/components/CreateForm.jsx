import React, { useState } from 'react'

function CreateForm({ onCreate }) {
  const [image, setImage] = useState('')
  const [portMapping, setPortMapping] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image.trim()) return

    setSubmitting(true)
    setError('')
    try {
      await onCreate({
        image: image.trim(),
        portMapping: portMapping.trim(),
        name: name.trim()
      })
      setImage('')
      setPortMapping('')
      setName('')
    } catch (e) {
      setError(e.message || '创建失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-form">
      <h2>创建容器</h2>
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="image">镜像名称 *</label>
          <input
            id="image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="例如: nginx:latest"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="portMapping">端口映射</label>
          <input
            id="portMapping"
            type="text"
            value={portMapping}
            onChange={(e) => setPortMapping(e.target.value)}
            placeholder="例如: 8080:80"
            disabled={submitting}
          />
          <p className="hint">格式：主机端口:容器端口</p>
        </div>

        <div className="form-group">
          <label htmlFor="name">容器名称（可选）</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="留空自动生成"
            disabled={submitting}
          />
        </div>

        <button type="submit" className="btn-create" disabled={submitting || !image.trim()}>
          {submitting ? '创建中...' : '🚀 创建容器'}
        </button>
      </form>
    </div>
  )
}

export default CreateForm
