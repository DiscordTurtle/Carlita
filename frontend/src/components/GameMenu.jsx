import React, { useState } from 'react'
import GameSettings from './GameSettings.jsx'

export default function GameMenu({ isOpen, onClose, masterVolume, setMasterVolume, onExit, onRespawn }) {
  const [showSettings, setShowSettings] = useState(false)

  React.useEffect(() => { if (!isOpen) setShowSettings(false) }, [isOpen])

  React.useEffect(() => {
    const handler = e => {
      if (e.key !== 'Escape') return
      if (showSettings) setShowSettings(false)
      else onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showSettings, onClose])

  if (!isOpen) return null

  if (showSettings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <GameSettings masterVolume={masterVolume} setMasterVolume={setMasterVolume} onBack={() => setShowSettings(false)} />
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}>
      <div style={{ background: 'linear-gradient(180deg,#1e3d50 0%,#152d3f 100%)', border: '2px solid #3a6080', borderRadius: 12, padding: 24, width: 240, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Btn onClick={() => { onExit?.() }}>Exit World</Btn>
        <Btn onClick={() => { onRespawn?.(); onClose() }}>Respawn</Btn>
        <Btn onClick={() => setShowSettings(true)}>Options</Btn>
      </div>
    </div>
  )
}

function Btn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      onMouseDown={e  => e.currentTarget.style.transform = 'translateY(3px)'}
      onMouseUp={e    => e.currentTarget.style.transform = ''}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
      style={{
        background: 'linear-gradient(180deg,#3d7090,#2a5570)',
        border: '2px solid #5a9ab8',
        borderRadius: 8,
        color: '#fff',
        fontFamily: '"Century Gothic",CenturyGothic,Geneva,sans-serif',
        fontWeight: 900,
        fontSize: 22,
        padding: '14px 0',
        width: '100%',
        cursor: 'pointer',
        textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
        boxShadow: '0 4px 0 #0d1e2a',
        transition: 'transform 0.06s',
      }}
    >
      {children}
    </button>
  )
}
