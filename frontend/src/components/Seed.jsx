import React from 'react'

// Pixel-art seed sprite from the inspo. Used both above Carlita's head while
// she's holding it and inside the action menu inventory slot.
export default function Seed({ size = 28 }) {
  return (
    <img
      src="/sprites/seed.webp"
      alt="seed"
      draggable={false}
      className="pixel"
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        objectFit: 'contain'
      }}
    />
  )
}
