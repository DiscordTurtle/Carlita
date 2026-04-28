import React from 'react'

// A Growtopia-style nametag + avatar.
// `walking`  triggers the 2-frame wiggle.
// `punching` adds a brief swing tilt.
// `y` raises the character (used for jump physics).
export default function Character({
  src, name, x, y = 0,
  facing = 'right', walking = false, punching = false,
  scale = 1, holding = null
}) {
  const flip = facing === 'left' ? -1 : 1
  const height = 110 * scale

  const swingStyle = punching
    ? { transform: `rotate(${flip < 0 ? 14 : -14}deg)`, transition: 'transform .1s' }
    : { transform: 'rotate(0deg)', transition: 'transform .15s' }

  return (
    <div
      className="absolute flex flex-col items-center pointer-events-none"
      style={{
        left: x,
        // Anchor 108px from screen bottom = ~12px below grass top, so the
        // avatar's transparent foot-padding overlaps the grass and the feet
        // visibly land on it.
        bottom: 108,
        transform: `translate(-50%, ${-y}px)`,
        zIndex: 20,
        transition: 'transform 0s'
      }}
    >
      {/* nametag — Growtopia "Legend" style: title icon + rainbow name, no box */}
      <div className="mb-1 flex items-center gap-2 text-xl">
        <img
          src="/sprites/leg-title.webp"
          alt=""
          className="pixel"
          style={{ width: 32, height: 32, imageRendering: 'pixelated' }}
        />
        <span className="legend-name">{name}</span>
      </div>

      {/* avatar wrapper */}
      <div className="relative" style={{ width: 90 * scale, height }}>
        <div
          className={`absolute inset-0 flex items-end justify-center ${walking ? 'animate-walk' : 'animate-idle-bob'}`}
          style={{ transformOrigin: 'bottom center', ...swingStyle }}
        >
          <div style={{ transform: `scaleX(${flip})`, height, display: 'flex', alignItems: 'flex-end' }}>
            <img
              src={src}
              alt={name}
              className="pixel block"
              style={{ height, width: 'auto' }}
              draggable={false}
            />
          </div>
        </div>
        {holding && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-3 animate-idle-bob">
            {holding}
          </div>
        )}
      </div>

      {/* shadow on the ground (shrinks while in the air) */}
      <div
        className="rounded-full bg-black/30 blur-[2px]"
        style={{
          width: Math.max(20, 60 * scale - y * 0.25),
          height: 8 * scale,
          marginTop: -4,
          opacity: Math.max(0.25, 1 - y / 200),
          transform: `translateY(${y}px)`  // shadow stays on the ground
        }}
      />
    </div>
  )
}
