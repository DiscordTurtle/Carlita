import React from 'react'

// Tiny pixel seed icon — yellow/brown teardrop with a sprout, used in HUD and as held item.
export default function Seed({ size = 28 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }} className="pixel">
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 35% 30%, #FFF3C4 0%, #F0B429 55%, #8D2B0B 100%)',
        borderRadius: '50% 50% 45% 55% / 60% 60% 40% 40%',
        border: '2px solid #5A3416',
        boxShadow: 'inset -2px -2px 0 rgba(0,0,0,.2)'
      }} />
      {/* sprout */}
      <div style={{
        position: 'absolute', left: '50%', top: -4,
        transform: 'translateX(-50%)',
        width: 4, height: 8, background: '#5BAE2F',
        border: '1px solid #2E5F12'
      }} />
    </div>
  )
}
