import React from 'react'

export default function SpeechBubble({ x, text }) {
  return (
    <div
      className="absolute pointer-events-none animate-pop"
      style={{
        left: x, bottom: 250,
        transform: 'translateX(-50%)',
        zIndex: 30
      }}
    >
      <div className="speech text-base">{text}</div>
    </div>
  )
}
