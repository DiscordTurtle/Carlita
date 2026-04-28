import React, { useEffect, useMemo, useState } from 'react'
import { playSfx } from '../useAudio.js'

export default function TitleScreen({ onPlay, splitting }) {
  const [playHover, setPlayHover] = useState(false)
  const [hasHovered, setHasHovered] = useState(false)

  // Defer applying the "go" classes by two frames so the browser has a chance
  // to compute the resting state first; otherwise the transition skips.
  const [going, setGoing] = useState(false)
  useEffect(() => {
    if (!splitting) { setGoing(false); return }
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => setGoing(true))
      return () => cancelAnimationFrame(id2)
    })
    return () => cancelAnimationFrame(id1)
  }, [splitting])

  const clouds = useMemo(() => {
    // Continuous left/right drift at varied speeds. `direction` is
    // 'normal' (flies right) or 'reverse' (flies left); negative delays
    // distribute their phases so they're already spread out at frame 0.
    const count = 14
    return Array.from({ length: count }).map((_, i) => {
      const topPct    = 4 + (i * 11 + (i % 2) * 5) % 80
      const duration  = 22 + ((i * 19) % 73)              // 22s … 95s
      const direction = i % 2 === 0 ? 'normal' : 'reverse'
      const delay     = -(duration * ((i * 17) % 100) / 100)
      // Used by the hover-scatter; pick a flight side based on parity since
      // we no longer have a fixed initial leftPct.
      const flyX = (i % 2 === 0 ? 1 : -1) * (60 + (i * 7) % 40)
      const flyY = (topPct < 50 ? -1 : 1) * (30 + (i * 5) % 25)
      return {
        id: i, topPct,
        width: 140 + ((i * 53) % 4) * 60,
        opacity: 0.55 + ((i * 13) % 40) / 100,
        duration, direction, delay, flyX, flyY
      }
    })
  }, [])

  // The full visual content of the title screen (background + sun + clouds + UI).
  // Rendered once normally, OR rendered TWICE inside clipped halves during
  // the split transition so each half can slide off in its own direction
  // while staying perfectly aligned with the other.
  const renderContent = ({ interactive }) => (
    <>
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 30%, #FFF3C4 0%, #F7C948 40%, #DE911D 100%)`
        }}
      />

      {/* Sun */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[1] pointer-events-none">
        <div
          className={
            playHover ? 'sun-spiral-out'
            : hasHovered ? 'sun-spiral-in'
            : ''
          }
          style={{ transformOrigin: 'center center', willChange: 'transform' }}
        >
          <img src="/sprites/sun.png" draggable={false} className="animate-sun-glow pixel" style={{ width: 220 }} alt="" />
        </div>
      </div>

      {/* Clouds — continuous L/R drift at varied speeds */}
      {clouds.map(c => (
        <div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            top: `${c.topPct}%`, left: 0, zIndex: 0,
            transform: playHover ? `translate(${c.flyX}vw, ${c.flyY}vh)` : 'translate(0, 0)',
            transition: 'transform 0.9s cubic-bezier(.22,1,.36,1), opacity 0.6s ease',
            opacity: playHover ? 0 : 1
          }}
        >
          <img
            src="/sprites/clouds.png"
            alt=""
            draggable={false}
            className="pixel"
            style={{
              width: c.width, opacity: c.opacity,
              animation: `cloudFly ${c.duration}s linear ${c.delay}s infinite ${c.direction}`,
              animationPlayState: playHover ? 'paused' : 'running'
            }}
          />
        </div>
      ))}

      {/* Foreground UI — forced to exactly 100vw so the centering of the
         logo/text/button lands on viewport center, not on whatever width the
         absolutely-positioned parent decided to be. */}
      <div
        className="relative z-[2] h-full flex flex-col items-center justify-center gap-8 px-4"
        style={{ width: '100vw' }}
      >
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
          onClick={() => { if (!interactive) return; playSfx('/sounds/click.wav', { volume: 0.6 }); onPlay() }}
          // The clipped-half copies are non-interactive; only the single
          // render path before splitting handles the click.
          style={{ pointerEvents: interactive ? 'auto' : 'none' }}
        >
          ▶ PLAY
        </button>
      </div>
    </>
  )

  // Normal render — single full-screen layer
  if (!splitting) {
    return (
      <div className="absolute inset-0 z-[100] overflow-hidden">
        {renderContent({ interactive: true })}
      </div>
    )
  }

  // Split render — two clipped copies that slide apart, revealing the
  // GameScene behind. The inner content is identical in both halves and
  // perfectly aligned, so before the slide they look like one unbroken image.
  return (
    <div className="absolute inset-0 z-[100] overflow-hidden pointer-events-none">
      <div className={`split-half split-left ${going ? 'split-go-left' : ''}`}>
        {renderContent({ interactive: false })}
      </div>
      <div className={`split-half split-right ${going ? 'split-go-right' : ''}`}>
        {renderContent({ interactive: false })}
      </div>
    </div>
  )
}
