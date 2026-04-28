import React from 'react'
import Seed from './Seed.jsx'
import { playSfx } from '../useAudio.js'

// Growtopia-style hotbar matching inspo/punch_menu.png.
const C = {
  background:    '#223a42',
  cells:         '#abd9ea',
  outline:       '#aee2f7',
  selected:      '#f1b404',
  selectedOuter: '#ffdd25'
}

// Display names for each inventory item — shown in the tooltip above the bar.
const ITEM_NAME = {
  punch:  'Fist',
  seed:   'Love Seed',
  letter: 'Love Letter'
}

export default function ActionMenu({ selected, onSelect, hasSeed, hasLetter }) {
  const slots = [
    { id: 'punch', icon: <PunchIcon />, count: null, enabled: true },
    // Seed slot disappears (becomes empty) once the seed has been planted.
    hasSeed
      ? { id: 'seed',  icon: <Seed size={34} />, count: 1,    enabled: true  }
      : { id: 'seed',  icon: null,                count: null, enabled: false },
    // Letter appears in slot 3 once Carlita walks over the dropped letter.
    hasLetter
      ? { id: 'letter', icon: <LetterIcon />, count: 1,    enabled: true  }
      : { id: 'empty1', icon: null,           count: null, enabled: false },
    { id: 'empty2', icon: null, count: null, enabled: false }
  ]

  const tooltipText = ITEM_NAME[selected]

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 bottom-3 z-[60] select-none flex flex-col items-center"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Selected-item tooltip — sits just above the bar, like Growtopia */}
      {tooltipText && (
        <div
          className="mb-2 px-3 py-1 rounded text-white text-sm font-extrabold tracking-wide"
          style={{
            background: C.background,
            border: `2px solid ${C.outline}`,
            boxShadow: '0 3px 0 rgba(0,0,0,.45), 0 6px 12px rgba(0,0,0,.3)',
            textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000'
          }}
        >
          {tooltipText}
        </div>
      )}

      <div
        className="flex gap-[6px] p-[6px] rounded-[10px]"
        style={{
          background: C.background,
          border: `3px solid ${C.background}`,
          boxShadow:
            `inset 0 0 0 2px ${C.outline},
             0 4px 0 rgba(0,0,0,.45),
             0 8px 16px rgba(0,0,0,.35)`
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
              className="relative w-16 h-16 rounded-[6px] transition-transform active:translate-y-[1px]"
              style={{
                background: C.background,
                border: `4px solid ${C.outline}`,
                boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.25), inset 0 0 0 1px rgba(0,0,0,.35)',
                cursor: s.enabled ? 'pointer' : 'not-allowed',
                opacity: s.enabled ? 1 : 0.85
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {s.icon}
              </div>
              {s.count != null && (
                <div
                  className="absolute right-1 bottom-0 text-white text-xs font-black"
                  style={{ textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000' }}
                >
                  {s.count}
                </div>
              )}
              {isSel && <SelectionCorners />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PunchIcon() {
  return (
    <img
      src="/sprites/punch.png"
      alt="punch"
      draggable={false}
      className="pixel"
      style={{ width: 38, height: 38, imageRendering: 'pixelated' }}
    />
  )
}

function LetterIcon() {
  return (
    <img
      src="/sprites/letter.webp"
      alt="letter"
      draggable={false}
      className="pixel"
      style={{ width: 38, height: 38, imageRendering: 'pixelated', objectFit: 'contain' }}
    />
  )
}

// Gold "broken outline" — looks like a single yellow frame with a small gap
// in the middle of each edge.
function SelectionCorners() {
  const armLen = 26
  const armW   = 4
  const off    = -4

  const cornerStyle = (side) => {
    const isTop  = side.top  !== undefined
    const isLeft = side.left !== undefined
    return {
      position: 'absolute',
      width:  armLen,
      height: armLen,
      pointerEvents: 'none',
      ...(isTop  ? { top:    off } : { bottom: off }),
      ...(isLeft ? { left:   off } : { right:  off }),
      [`border${isTop  ? 'Top'  : 'Bottom'}`]: `${armW}px solid ${C.selected}`,
      [`border${isLeft ? 'Left' : 'Right'}`]:  `${armW}px solid ${C.selected}`
    }
  }

  return (
    <>
      <div style={cornerStyle({ top: 0, left:  0 })} />
      <div style={cornerStyle({ top: 0, right: 0 })} />
      <div style={cornerStyle({ bottom: 0, left:  0 })} />
      <div style={cornerStyle({ bottom: 0, right: 0 })} />
    </>
  )
}
