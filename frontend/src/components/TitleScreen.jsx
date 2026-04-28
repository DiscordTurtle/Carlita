import React, { useMemo } from 'react'
import { playSfx } from '../useAudio.js'

export default function TitleScreen({ onPlay }) {
  // Pre-compute clouds spread across the whole screen with proportional negative
  // animation-delays so they appear to be at different points along the same
  // long traverse (left -> right) right from the first frame.
  const clouds = useMemo(() => {
    // Spread starting horizontal positions across the whole screen with explicit
    // `left` percentages, then let each one gently drift sideways.
    const positions = [
      { left:  4, top:  6 }, { left: 18, top: 22 }, { left: 32, top:  4 },
      { left: 46, top: 18 }, { left: 60, top:  9 }, { left: 74, top: 26 },
      { left: 88, top: 12 }, { left: 12, top: 48 }, { left: 38, top: 58 },
      { left: 62, top: 52 }, { left: 82, top: 64 }, { left: 26, top: 78 },
      { left: 54, top: 82 }, { left: 78, top: 88 }
    ]
    return positions.map((p, i) => {
      const duration = 28 + (i * 5) % 24    // 28–52s, varied
      const delay    = -(duration * ((i * 7) % 100) / 100)  // staggered phase
      return {
        id: i,
        leftPct: p.left,
        topPct:  p.top,
        width:   140 + ((i * 53) % 4) * 60,   // 140 / 200 / 260 / 320
        opacity: 0.55 + ((i * 13) % 40) / 100,
        duration,
        delay,
        reverse: i % 2 === 0
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
      {/* Sun */}
      <img
        src="/sprites/sun.png"
        className="absolute top-10 left-1/2 -translate-x-1/2 animate-sun-glow pixel z-[1]"
        style={{ width: 220 }}
        alt=""
      />

      {/* Drifting clouds — spread across, layered behind UI */}
      {clouds.map(c => (
        <img
          key={c.id}
          src="/sprites/clouds.png"
          alt=""
          className="absolute pixel pointer-events-none"
          style={{
            top:    `${c.topPct}%`,
            left:   `${c.leftPct}%`,
            width:  c.width,
            opacity: c.opacity,
            animation: `cloudDrift ${c.duration}s ease-in-out ${c.delay}s infinite alternate ${c.reverse ? 'reverse' : ''}`.trim(),
            zIndex: 0
          }}
        />
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
          onClick={() => { playSfx('/sounds/click.wav', { volume: 0.6 }); onPlay() }}
        >
          ▶ PLAY
        </button>
      </div>
    </div>
  )
}
