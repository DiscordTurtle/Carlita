import React, { useState } from 'react'
import GameSettings from './GameSettings.jsx'

export default function GameMenu({ isOpen, onClose, masterVolume, setMasterVolume }) {
  const [screen, setScreen] = useState('main') // 'main' or 'settings'

  // Reset to main screen when menu closes
  React.useEffect(() => {
    if (!isOpen) {
      setScreen('main')
    }
  }, [isOpen])

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (screen === 'settings') {
          setScreen('main')
        } else {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [screen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) return // prevent closing on background click
      }}
    >
      {screen === 'main' && (
        <div className="pixel text-center">
          <div
            className="rounded-lg border-4 border-blue-300 bg-blue-900 px-8 py-6 shadow-2xl"
            style={{
              minWidth: '240px',
              background: 'linear-gradient(135deg, #1a4d6d 0%, #0d2e42 100%)',
              borderColor: '#5fa8d3'
            }}
          >
            <h1
              className="mb-6 text-2xl font-bold"
              style={{
                color: '#e8f4f8',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                letterSpacing: '0.1em'
              }}
            >
              Menu
            </h1>

            <div className="space-y-3">
              <MenuButton onClick={() => setScreen('settings')}>
                Options
              </MenuButton>
              <MenuButton onClick={onClose}>
                Resume
              </MenuButton>
              <MenuButton onClick={() => window.location.href = '/'}>
                Exit World
              </MenuButton>
            </div>
          </div>
        </div>
      )}

      {screen === 'settings' && (
        <GameSettings
          masterVolume={masterVolume}
          setMasterVolume={setMasterVolume}
          onBack={() => setScreen('main')}
        />
      )}
    </div>
  )
}

function MenuButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded px-4 py-2 font-bold transition-all"
      style={{
        background: 'linear-gradient(135deg, #4a9fbf 0%, #2d5f7d 100%)',
        color: '#e8f4f8',
        textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
        border: '2px solid #7cc4e8',
        cursor: 'pointer',
        fontSize: '16px',
        letterSpacing: '0.05em'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'linear-gradient(135deg, #5aafcf 0%, #3d6f8d 100%)'
        e.target.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'linear-gradient(135deg, #4a9fbf 0%, #2d5f7d 100%)'
        e.target.style.transform = 'translateY(0)'
      }}
    >
      {children}
    </button>
  )
}
