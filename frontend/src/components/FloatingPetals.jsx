import { useEffect, useState } from 'react';

const PETAL_CHARS = ['🌸', '🌼', '✨', '💛', '🌻', '⭐', '💫'];

function Petal({ id }) {
  const left    = Math.random() * 100;          // % from left
  const size    = 12 + Math.random() * 18;      // px font-size
  const dur     = 6 + Math.random() * 10;       // seconds
  const delay   = Math.random() * 10;           // seconds
  const char    = PETAL_CHARS[Math.floor(Math.random() * PETAL_CHARS.length)];

  return (
    <span
      style={{
        position: 'fixed',
        left: `${left}%`,
        top: '-2rem',
        fontSize: `${size}px`,
        animation: `petalDrift ${dur}s linear ${delay}s infinite`,
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
        opacity: 0,
      }}
      aria-hidden="true"
    >
      {char}
    </span>
  );
}

export default function FloatingPetals({ count = 22 }) {
  const [petals] = useState(() =>
    Array.from({ length: count }, (_, i) => i)
  );

  return (
    <div aria-hidden="true">
      {petals.map((id) => (
        <Petal key={id} id={id} />
      ))}
    </div>
  );
}
