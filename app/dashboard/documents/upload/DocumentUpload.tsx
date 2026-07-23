'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export function DocumentUpload() {
  const router = useRouter()
  const [state, setState] = useState<UploadState>('idle')
  const [message, setMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setState('uploading')
    setMessage(`Processing "${file.name}" — parsing, chunking, and embedding...`)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/documents/ingest', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setState('error')
        setMessage(data.error || 'Upload failed')
        return
      }

      setState('success')
      setMessage(`"${data.document.name}" processed — ${data.document.chunks} chunks embedded.`)
      setTimeout(() => {
        router.refresh()
        setState('idle')
        setMessage('')
      }, 2000)
    } catch {
      setState('error')
      setMessage('Upload failed — check your connection.')
    }
  }

  function handleFile(files: FileList | null) {
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          if (state !== 'uploading') handleFile(e.dataTransfer.files)
        }}
        onClick={() => state !== 'uploading' && fileInput.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#534AB7' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '2.5rem',
          textAlign: 'center',
          cursor: state === 'uploading' ? 'default' : 'pointer',
          background: dragOver ? '#EEEDFE' : '#fafafa',
          transition: 'all 0.15s',
        }}
      >
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.docx,.txt,.md,.csv"
          onChange={e => handleFile(e.target.files)}
          style={{ display: 'none' }}
        />

        {state === 'uploading' ? (
          <>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Processing...</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{message}</div>
          </>
        ) : state === 'success' ? (
          <>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>✓</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#0F6E56' }}>{message}</div>
          </>
        ) : state === 'error' ? (
          <>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚠</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#b91c1c' }}>{message}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>Click to try again</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>▤</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              Drop a document here, or click to browse
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
              PDF, Word, text, markdown, or CSV
            </div>
          </>
        )}
      </div>
    </div>
  )
}
