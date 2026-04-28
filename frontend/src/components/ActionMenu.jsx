import React from 'react'
import Seed from './Seed.jsx'
import { playSfx } from '../useAudio.js'

// Growtopia-style hotbar inspired by inspo/punch_menu.png
// Slots: punch (fist), seed, plus 2 empty cosmetic slots.
export default function ActionMenu({ selected, onSelect, hasSeed }) {
  const slots = [
    { id: 'punch', icon: <Fist />,        count: null,             enabled: true,    label: 'PUNCH' },
    { id: 'seed',  icon: <Seed size={28} />, count: hasSeed ? 1 : 0, enabled: hasSeed, label: 'SEED'  },
    { id: 'empty1', icon: null, count: null, enabled: false, label: '' },
    { id: 'empty2', icon: null, count: null, enabled: false, label: '' }
  ]

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 bottom-3 z-[60] select-none"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{
          background: 'linear-gradient(#1B6FA8, #0E4670)',
          border: '3px solid #08344F',
          boxShadow: '0 4px 0 #052238, 0 8px 14px rgba(0,0,0,.4), inset 0 0 0 2px #2a8fcd'
        }}
      >
        {slots.map(s => {
          const isSel = selected === s.id
          return (
            <button
              key={s.id}
              disabled={!s.enabled}
              onClick={(e) => {
                e.stopPropagation()
                if (!s.enabled) { playSfx('/sounds/blip.wav', { volume: 0.4 }); return }
                playSfx('/sounds/click.wav', { volume: 0.5 })
                onSelect(s.id)
              }}
              className="relative w-14 h-14 rounded-md transition-transform active:translate-y-[1px]"
              style={{
                background: s.enabled
                  ? 'linear-gradient(#3FA9F5, #1670B5)'
                  : 'linear-gradient(#234e6e, #15334a)',
                border: isSel
                  ? '3px solid #FADB5F'
                  : s.id === 'seed'
                  ? '3px solid #5BAE2F'
                  : '3px solid #08344F',
                boxShadow: isSel
                  ? '0 0 0 2px #DE911D, inset 0 0 8px rgba(255, 219, 95, .5)'
                  : 'inset 0 -3px 0 rgba(0,0,0,.25)',
                cursor: s.enabled ? 'pointer' : 'not-allowed'
              }}
              title={s.label}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {s.icon}
              </div>
              {s.count != null && (
                <div className="absolute right-0.5 bottom-0 text-white text-[11px] font-black"
                     style={{ textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000' }}>
                  {s.count}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Fist() {
  // Tan pixel-art fist matching inspo
  return (
    <div style={{ width: 30, height: 30, position: 'relative' }} className="pixel">
      <div style={{
        position: 'absolute', inset: 2,
        background: 'linear-gradient(#E2B084, #B47542)',
        border: '2px solid #5A3416',
        borderRadius: 4,
        boxShadow: 'inset -2px -2px 0 rgba(0,0,0,.25), inset 2px 2px 0 rgba(255,255,255,.2)'
      }} />
      <div style={{
        position: 'absolute', left: 6, top: 9, width: 16, height: 4,
        background: '#5A3416', borderRadius: 1
      }} />
      <div style={{
        position: 'absolute', left: 6, top: 16, width: 16, height: 4,
        background: '#5A3416', borderRadius: 1
      }} />
    </div>
  )
}
