import React, { useMemo } from 'react'

const COLORS = ['#FADB5F', '#F0B429', '#FF6B6B', '#7BC74D', '#5BAEFF', '#C2185B', '#FFFBEA']

export default function Fireworks({ count = 18 }) {
  const bursts = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    y: 10 + Math.random() * 60,
    delay: Math.random() * 1.6,
    color: COLORS[i % COLORS.length],
    size: 80 + Math.random() * 120
  })), [count])

  return (
    <div className="absolute inset-0 pointer-events-none z-[40]">
      {bursts.map(b => (
        <div
          key={b.id}
          className="absolute animate-firework"
          style={{
            left: `${b.x}%`, top: `${b.y}%`,
            width: b.size, height: b.size,
            marginLeft: -b.size / 2, marginTop: -b.size / 2,
            animationDelay: `${b.delay}s`,
            background:
              `radial-gradient(circle, ${b.color} 0%, ${b.color}AA 30%, transparent 60%),
               conic-gradient(from 0deg,
                 ${b.color} 0 8deg, transparent 8deg 22deg,
                 ${b.color} 22deg 30deg, transparent 30deg 44deg,
                 ${b.color} 44deg 52deg, transparent 52deg 66deg,
                 ${b.color} 66deg 74deg, transparent 74deg 88deg,
                 ${b.color} 88deg 96deg, transparent 96deg 110deg,
                 ${b.color} 110deg 118deg, transparent 118deg 132deg,
                 ${b.color} 132deg 140deg, transparent 140deg 154deg,
                 ${b.color} 154deg 162deg, transparent 162deg 176deg,
                 ${b.color} 176deg 184deg, transparent 184deg 198deg,
                 ${b.color} 198deg 206deg, transparent 206deg 220deg,
                 ${b.color} 220deg 228deg, transparent 228deg 242deg,
                 ${b.color} 242deg 250deg, transparent 250deg 264deg,
                 ${b.color} 264deg 272deg, transparent 272deg 286deg,
                 ${b.color} 286deg 294deg, transparent 294deg 308deg,
                 ${b.color} 308deg 316deg, transparent 316deg 330deg,
                 ${b.color} 330deg 338deg, transparent 338deg 352deg)`,
            borderRadius: '50%',
            mixBlendMode: 'screen'
          }}
        />
      ))}
    </div>
  )
}
