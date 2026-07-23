'use client'

import { useState } from 'react'

type Topic = { id: string; name: string }

export function DomainPicker({ topics }: { topics: Topic[] }) {
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  function toggleTopic(topic: Topic) {
    setSelectedTopics(prev =>
      prev.find(t => t.id === topic.id)
        ? prev.filter(t => t.id !== topic.id)
        : [...prev, topic]
    )
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !customTags.includes(t)) {
      setCustomTags(prev => [...prev, t])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setCustomTags(prev => prev.filter(t => t !== tag))
  }

  // Merge topic names + custom tags for the domains field
  const allDomains = [...selectedTopics.map(t => t.name), ...customTags].join(',')
  const topicIds = selectedTopics.map(t => t.id).join(',')

  return (
    <div>
      {/* Hidden fields submitted with the form */}
      <input type="hidden" name="domains" value={allDomains} />
      <input type="hidden" name="topic_ids" value={topicIds} />

      {/* Topic chips */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
          Knowledge domains — pick from your topics
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {topics.length === 0 && (
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>
              No topics yet — add custom tags below.
            </span>
          )}
          {topics.map(topic => {
            const selected = selectedTopics.find(t => t.id === topic.id)
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleTopic(topic)}
                style={{
                  fontSize: '13px', padding: '5px 12px', borderRadius: '20px',
                  border: selected ? '1px solid #534AB7' : '1px solid #d1d5db',
                  background: selected ? '#EEEDFE' : '#fff',
                  color: selected ? '#3C3489' : '#374151',
                  cursor: 'pointer', fontWeight: selected ? 500 : 400
                }}
              >
                {selected ? '✓ ' : ''}{topic.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom tags */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
          Add custom expertise tags
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); addTag() }
            }}
            placeholder="e.g. Legacy PLC systems"
            style={{
              flex: 1, padding: '8px 12px', border: '1px solid #d1d5db',
              borderRadius: '8px', fontSize: '14px', outline: 'none'
            }}
          />
          <button
            type="button"
            onClick={addTag}
            style={{
              padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
              background: '#fff', fontSize: '14px', cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
        {customTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {customTags.map(tag => (
              <span key={tag} style={{
                fontSize: '13px', padding: '5px 10px', borderRadius: '20px',
                background: '#E1F5EE', color: '#0F6E56',
                display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}>
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{
                    border: 'none', background: 'none', color: '#0F6E56',
                    cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1
                  }}
                >×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
