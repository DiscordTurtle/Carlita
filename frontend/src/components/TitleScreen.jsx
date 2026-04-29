import React, { useEffect, useMemo, useState } from 'react'
import { playSfx } from '../useAudio.js'

// Composite logo dimensions (px). Tuned so "Grow" and "opia" sit on either
// side of the tree trunk like the original Growtopia logo. Each PNG has
// transparent padding around its glyphs — `growLeft` shifts grow.png right
// so its visible "w" tucks against the tree's left foliage instead of
// leaving a visible gap before the tree.
const LOGO = {
  width:    640,
  height:   260,
  growW:    300,
  opiaW:    240,
  treeW:    340,
  leafW:    72,
  growLeft: 20,    // shifted right so "w" meets the tree's foliage
  opiaRight:65,
  opiaTop:  88,
  treeLeft: 85,
  treeTop:  20,
  leafLeft: 363,
  leafTop:  94
}

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
      const duration  = 22 + ((i * 19) % 73)
      const direction = i % 2 === 0 ? 'normal' : 'reverse'
      const delay     = -(duration * ((i * 17) % 100) / 100)
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

  return (
    <div
      className="absolute inset-0 z-[100] overflow-hidden"
      style={{ pointerEvents: splitting ? 'none' : 'auto' }}
    >
      {/* === Background gradient, split into two halves ===
         Each half is exactly 50vw wide and slides its own width off-screen
         when the split fires. Because each half is a self-contained block of
         the SAME gradient, they look like one seamless background until they
         move, and they move purely under their own width. */}
      <div
        className={`absolute top-0 left-0 h-full w-1/2 split-bg-half ${going ? 'split-bg-go-left' : ''}`}
        style={{
          background: 'radial-gradient(circle at 100% 30%, #FFF3C4 0%, #F7C948 40%, #DE911D 120%)'
        }}
      />
      <div
        className={`absolute top-0 right-0 h-full w-1/2 split-bg-half ${going ? 'split-bg-go-right' : ''}`}
        style={{
          background: 'radial-gradient(circle at 0% 30%, #FFF3C4 0%, #F7C948 40%, #DE911D 120%)'
        }}
      />

      {/* === Sun === */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 z-[3] pointer-events-none"
        style={{
          opacity: splitting ? 0 : 1,
          transition: 'opacity 0.35s ease'
        }}
      >
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

      {/* === Clouds === */}
      {clouds.map(c => (
        <div
          key={c.id}
          className="absolute pointer-events-none z-[2]"
          style={{
            top: `${c.topPct}%`, left: 0,
            transform: playHover ? `translate(${c.flyX}vw, ${c.flyY}vh)` : 'translate(0, 0)',
            transition: 'transform 0.9s cubic-bezier(.22,1,.36,1), opacity 0.6s ease',
            opacity: splitting ? 0 : (playHover ? 0 : 1)
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

      {/* === Foreground: composite logo + text + button === */}
      <div
        className="relative z-[4] h-full flex flex-col items-center justify-center gap-8 px-4"
        style={{ width: '100vw' }}
      >
        {/* Composite logo: grow.png + tree.png + opia.png + Leaf.png
            Each piece is absolutely positioned inside a relative box so we
            can animate them independently during the split. */}
        <div
          className="relative"
          style={{
            width:  Math.min(LOGO.width, 0.8 * (typeof window !== 'undefined' ? window.innerWidth : 1280)),
            height: LOGO.height
          }}
        >
          {/* Tree (behind the letters) — falls straight down rapidly on split */}
          <img
            src="/sprites/logo-tree.png"
            alt=""
            draggable={false}
            className={`absolute pixel ${going ? 'logo-tree-fall' : ''}`}
            style={{
              left: LOGO.treeLeft,
              top:  LOGO.treeTop,
              width: LOGO.treeW,
              zIndex: 1,
              filter: 'drop-shadow(0 6px 0 rgba(0,0,0,.25))'
            }}
          />

          {/* Grow (left letters) — flies off with the LEFT half */}
          <img
            src="/sprites/grow.png"
            alt="Grow"
            draggable={false}
            className={`absolute pixel ${going ? 'logo-grow-go' : ''}`}
            style={{
              left:   LOGO.growLeft,
              top:    40,
              width:  LOGO.growW,
              zIndex: 2,
              filter: 'drop-shadow(0 4px 0 rgba(0,0,0,.25))'
            }}
          />

          {/* Opia (right letters) — flies off with the RIGHT half */}
          <img
            src="/sprites/opia.png"
            alt="opia"
            draggable={false}
            className={`absolute pixel ${going ? 'logo-opia-go' : ''}`}
            style={{
              right:  LOGO.opiaRight,
              top:    LOGO.opiaTop,
              width:  LOGO.opiaW,
              zIndex: 2,
              filter: 'drop-shadow(0 4px 0 rgba(0,0,0,.25))'
            }}
          />

          {/* Leaf — slowly drifts down with a swaying motion */}
          <img
            src="/sprites/logo-leaf.png"
            alt=""
            draggable={false}
            className={`absolute pixel ${going ? 'logo-leaf-fall' : ''}`}
            style={{
              left:  LOGO.leafLeft,
              top:   LOGO.leafTop,
              width: LOGO.leafW,
              zIndex: 3,
              filter: 'drop-shadow(0 2px 0 rgba(0,0,0,.25))'
            }}
          />
        </div>

        {/* Title text — fades out on split */}
        <div
          className="text-center"
          style={{
            opacity: splitting ? 0 : 1,
            transition: 'opacity 0.35s ease'
          }}
        >
          <div className="text-4xl md:text-5xl font-black gt-stroke text-[#FFF3C4]">
            Carlita &amp; Cristian
          </div>
          <div className="mt-2 text-xl md:text-2xl font-bold gt-stroke text-[#FFF3C4]">
            Un an impreuna ♥
          </div>
        </div>

        {/* PLAY button — fades out on split */}
        <button
          className="gt-btn text-3xl md:text-4xl font-black px-12 py-4 rounded-2xl tracking-widest"
          onMouseEnter={() => { setPlayHover(true); setHasHovered(true) }}
          onMouseLeave={() => setPlayHover(false)}
          onFocus={() => { setPlayHover(true); setHasHovered(true) }}
          onBlur={() => setPlayHover(false)}
          onClick={() => { if (splitting) return; playSfx('/sounds/click.wav', { volume: 0.6 }); onPlay() }}
          style={{
            opacity: splitting ? 0 : 1,
            transition: 'opacity 0.35s ease',
            pointerEvents: splitting ? 'none' : 'auto'
          }}
        >
          ▶ PLAY
        </button>
      </div>
    </div>
  )
}
