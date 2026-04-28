import React from 'react'
import Seed from './Seed.jsx'
import { playSfx } from '../useAudio.js'

// Growtopia-style hotbar matching inspo/punch_menu.png.
// Colors are pulled directly from README.md (COLORS).
const C = {
  background:    '#223a42',
  cells:         '#abd9ea',
  outline:       '#aee2f7',
  selected:      '#f1b404',
  selectedOuter: '#ffdd25'
}

export default function ActionMenu({ selected, onSelect, hasSeed }) {
  const slots = [
    { id: 'punch', icon: <PunchIcon />,         count: null,             enabled: true,    label: 'PUNCH' },
    { id: 'seed',  icon: <Seed size={34} />,    count: hasSeed ? 1 : 0,  enabled: hasSeed, label: 'SEED'  },
    { id: 'empty1', icon: null, count: null, enabled: false, label: '' },
    { id: 'empty2', icon: null, count: null, enabled: false, label: '' }
  ]

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 bottom-3 z-[60] select-none"
      style={{ pointerEvents: 'auto' }}
    >
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
                // Cell background matches the dark frame blue from the inspo,
                // distinguished from the frame by its thicker lighter outline.
                background: C.background,
                border: `4px solid ${C.outline}`,
                boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.25), inset 0 0 0 1px rgba(0,0,0,.35)',
                cursor: s.enabled ? 'pointer' : 'not-allowed',
                opacity: s.enabled ? 1 : 0.85
              }}
              title={s.label}
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
              {/* Selected indicator: 4 L-shaped corner brackets only — no full outline. */}
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

// Gold "broken outline" — looks like a single yellow frame around the slot
// with a small gap cut out of the middle of each edge. Implemented as 4
// L-shaped corner pieces whose arms are long enough to nearly meet, so the
// effect reads as one outline rather than four separate accents.
function SelectionCorners() {
  const armLen = 26   // length of each arm — long enough that the four
                      // corners visually connect into an interrupted frame
  const armW   = 4    // stroke thickness — matches the cell's blue outline
  const off    = -4   // sits just outside the slot

  const cornerStyle = (side) => {
    const isTop    = side.top    !== undefined
    const isLeft   = side.left   !== undefined
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
