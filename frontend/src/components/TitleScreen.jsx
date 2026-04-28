import React, { useMemo, useState } from 'react'
import { playSfx } from '../useAudio.js'

export default function TitleScreen({ onPlay }) {
  const [playHover, setPlayHover] = useState(false)
  // Track whether the user has ever hovered, so the sun doesn't play the
  // "spiral-in" animation on first mount (it would otherwise unwantedly fly
  // in from off-screen on page load).
  const [hasHovered, setHasHovered] = useState(false)

  // Pre-compute clouds spread across the whole screen with proportional negative
  // animation-delays so they appear to be at different points along the same
  // long traverse (left -> right) right from the first frame.
  const clouds = useMemo(() => {
    const positions = [
      { left:  4, top:  6 }, { left: 18, top: 22 }, { left: 32, top:  4 },
      { left: 46, top: 18 }, { left: 60, top:  9 }, { left: 74, top: 26 },
      { left: 88, top: 12 }, { left: 12, top: 48 }, { left: 38, top: 58 },
      { left: 62, top: 52 }, { left: 82, top: 64 }, { left: 26, top: 78 },
      { left: 54, top: 82 }, { left: 78, top: 88 }
    ]
    return positions.map((p, i) => {
      const duration = 28 + (i * 5) % 24    // 28–52s
      const delay    = -(duration * ((i * 7) % 100) / 100)  // staggered phase
      // Direction each cloud flees on hover: left-half clouds fly left, right
      // half fly right. Add some vertical bias so they scatter naturally.
      const flyX = (p.left < 50 ? -1 : 1) * (60 + (i * 7) % 40)   // vw
      const flyY = (p.top  < 50 ? -1 : 1) * (30 + (i * 5) % 25)   // vh
      return {
        id: i,
        leftPct: p.left,
        topPct:  p.top,
        width:   140 + ((i * 53) % 4) * 60,
        opacity: 0.55 + ((i * 13) % 40) / 100,
        duration,
        delay,
        reverse: i % 2 === 0,
        flyX,
        flyY
      }
    })
  }, [])

  return (
    <div className="absolute inset-0 z-[100] overflow-hidden"
         style={{
           background:
             `radial-gradient(circle at 50% 30%, #FFF3C4 0%, #F7C948 40%, #DE911D 100%)`
         }}
    >
      {/* Sun — outer wrapper handles centering, inner wrapper plays the
         spiral-out / spiral-in animation, and the <img> keeps its glow. */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[1] pointer-events-none">
        <div
          className={
            playHover ? 'sun-spiral-out'
            : hasHovered ? 'sun-spiral-in'
            : ''
          }
          style={{ transformOrigin: 'center center', willChange: 'transform' }}
        >
          <img
            src="/sprites/sun.png"
            className="animate-sun-glow pixel"
            style={{ width: 220 }}
            alt=""
          />
        </div>
      </div>

      {/* Drifting clouds — outer wrapper handles the hover-scatter (with a
         smooth transition); the inner img keeps its endless drift animation. */}
      {clouds.map(c => (
        <div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            top:    `${c.topPct}%`,
            left:   `${c.leftPct}%`,
            zIndex: 0,
            transform: playHover
              ? `translate(${c.flyX}vw, ${c.flyY}vh)`
              : 'translate(0, 0)',
            transition: 'transform 0.9s cubic-bezier(.22,1,.36,1), opacity 0.6s ease',
            opacity: playHover ? 0 : 1,
            // pause the inner drift while parted so it doesn't visually fight
            animationPlayState: playHover ? 'paused' : 'running'
          }}
        >
          <img
            src="/sprites/clouds.png"
            alt=""
            className="pixel"
            style={{
              width:   c.width,
              opacity: c.opacity,
              animation: `cloudDrift ${c.duration}s ease-in-out ${c.delay}s infinite alternate ${c.reverse ? 'reverse' : ''}`.trim(),
              animationPlayState: playHover ? 'paused' : 'running'
            }}
          />
        </div>
      ))}

      <div className="relative z-[2] h-full flex flex-col items-center justify-center gap-8 px-4">
        <img src="/sprites/logo.png" className="pixel max-w-[640px] w-[80vw] drop-shadow-2xl" alt="Growtopia" />

        <div className="text-center">
          <div className="text-4xl md:text-5xl font-black gt-stroke text-[#FFF3C4]">
            Carlita &amp; Cristian
          </div>
          <div className="mt-2 text-xl md:text-2xl font-bold gt-stroke text-[#FFF3C4]">
            Un an impreuna ♥
          </div>
        </div>

        <button
          className="gt-btn text-3xl md:text-4xl font-black px-12 py-4 rounded-2xl tracking-widest"
          onMouseEnter={() => { setPlayHover(true); setHasHovered(true) }}
          onMouseLeave={() => setPlayHover(false)}
          onFocus={() => { setPlayHover(true); setHasHovered(true) }}
          onBlur={() => setPlayHover(false)}
          onClick={() => { playSfx('/sounds/click.wav', { volume: 0.6 }); onPlay() }}
        >
          ▶ PLAY
        </button>
      </div>
    </div>
  )
}
