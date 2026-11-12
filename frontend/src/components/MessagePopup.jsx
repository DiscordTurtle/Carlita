import React, { useEffect, useState } from 'react'

const MESSAGE = "Heyyy! La multi ani!! Vino sa vezi ce parkour am facut pentru tine!"

export default function MessagePopup({ onDismiss }) {
  const [shown, setShown] = useState(0)   // chars revealed so far
  const done = shown >= MESSAGE.length

  useEffect(() => {
    if (done) return
    const id = setInterval(() => setShown(n => Math.min(n + 1, MESSAGE.length)), 40)
    return () => clearInterval(id)
  }, [done])

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
         style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div style={{
        background: 'linear-gradient(180deg, #1e3148 0%, #162436 100%)',
        border: '3px solid #4a7aaa',
        borderRadius: 8,
        boxShadow: '0 0 0 1px #0a1520, 0 8px 32px rgba(0,0,0,0.7)',
        padding: '18px 22px',
        maxWidth: 480,
        width: '90vw',
        fontFamily: '"Century Gothic", CenturyGothic, Geneva, sans-serif',
      }}>
        {/* header bar */}
        <div style={{
          background: '#0f1e2e',
          border: '1px solid #2a4a6a',
          borderRadius: 4,
          padding: '6px 12px',
          marginBottom: 14,
          fontSize: 11,
          color: '#8ab8d8',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Message
        </div>

        {/* chat line */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', minHeight: 56 }}>
          {/* avatar dot */}
          <div style={{
            width: 36, height: 36, borderRadius: 4, flexShrink: 0,
            background: 'linear-gradient(135deg, #4a90d9, #2a5a99)',
            border: '2px solid #6ab0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            👤
          </div>
          <div>
            <span style={{ color: '#f0c040', fontWeight: 700, fontSize: 14 }}>Cristian: </span>
            <span style={{ color: '#e8f0f8', fontSize: 14, lineHeight: 1.5 }}>
              {MESSAGE.slice(0, shown)}
              {!done && <span style={{ opacity: 0.6 }}>|</span>}
            </span>
          </div>
        </div>

        {/* OK button — only after typing done */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            disabled={!done}
            onClick={onDismiss}
            style={{
              background: done ? 'linear-gradient(180deg,#5aaa3a,#3a7a1e)' : '#1e3040',
              border: `2px solid ${done ? '#7acc50' : '#2a4a5a'}`,
              borderRadius: 6,
              color: done ? '#d4ffb0' : '#3a5a6a',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 15,
              padding: '7px 28px',
              cursor: done ? 'pointer' : 'default',
              boxShadow: done ? '0 3px 0 #1a4a08, 0 0 12px rgba(90,200,50,0.4)' : 'none',
              transition: 'all 0.2s',
              letterSpacing: '0.05em',
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
