import { motion } from 'framer-motion';
import { useState } from 'react';
import SunflowerSVG from './SunflowerSVG';

const QUOTES = [
  "Just like sunflowers always face the sun,\nI always find myself turning to you.",
  "You are the brightest thing in every room,\nand in every room of my heart.",
  "They say sunflowers are resilient - they grow\ntoward the light no matter what.\nSo do you. That's why I love you.",
];

function GardenFlower({ x, y, size, delay, planted = true }) {
  return (
    <motion.div
      style={{ position: 'absolute', left: `${x}%`, bottom: `${y}px`, transformOrigin: 'bottom center' }}
      initial={{ scaleY: 0, opacity: 0 }}
      whileInView={{ scaleY: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Stem */}
      <div
        style={{
          width: 4,
          height: size * 0.8,
          background: 'linear-gradient(180deg,#16A34A,#4ade80)',
          margin: '0 auto',
          borderRadius: 2,
        }}
      />
      {/* Flower head */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: -size * 0.05 }}>
        <SunflowerSVG size={size} />
      </div>
    </motion.div>
  );
}

function ClickSparkle({ x, y }) {
  return (
    <motion.div
      style={{ position: 'fixed', left: x - 20, top: y - 20, pointerEvents: 'none', zIndex: 9999 }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <span style={{ fontSize: 36 }}>🌻</span>
    </motion.div>
  );
}

const BASE_FLOWERS = [
  { id: 1, x: 8,  y: 0, size: 110, delay: 0.1 },
  { id: 2, x: 20, y: 0, size: 90,  delay: 0.25 },
  { id: 3, x: 33, y: 0, size: 130, delay: 0.15 },
  { id: 4, x: 47, y: 0, size: 100, delay: 0.3 },
  { id: 5, x: 60, y: 0, size: 120, delay: 0.1 },
  { id: 6, x: 73, y: 0, size: 95,  delay: 0.2 },
  { id: 7, x: 85, y: 0, size: 115, delay: 0.05 },
];

export default function SunflowerGarden() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [sparkles, setSparkles] = useState([]);
  const [extraFlowers, setExtraFlowers] = useState([]);

  const handleClick = (e) => {
    const id = Date.now();
    setSparkles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setSparkles((prev) => prev.filter((s) => s.id !== id)), 800);

    // Plant a new flower near click position
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    setExtraFlowers((prev) => [
      ...prev,
      { id, x: Math.max(2, Math.min(92, xPct)), y: 0, size: 60 + Math.random() * 50, delay: 0 },
    ]);

    // Cycle quote
    setQuoteIdx((i) => (i + 1) % QUOTES.length);
  };

  return (
    <section
      id="garden"
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFFDE7 0%, #FEF9C3 60%, #FDE68A 100%)' }}
    >
      {/* Sparkles on click */}
      {sparkles.map((s) => <ClickSparkle key={s.id} x={s.x} y={s.y} />)}

      <div className="max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ color: '#92400E', letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: 8 }}
        >
          — The Garden —
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-handwriting mb-4"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.8rem)', color: '#78350F' }}
        >
          Our Little Sunflower Field 🌻
        </motion.h2>

        {/* Animated quote */}
        <motion.div
          key={quoteIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="font-handwriting mx-auto mb-10"
          style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#D97706', maxWidth: 560, whiteSpace: 'pre-line' }}
        >
          "{QUOTES[quoteIdx]}"
        </motion.div>

        {/* Clickable garden */}
        <div
          onClick={handleClick}
          style={{
            position: 'relative',
            height: 260,
            cursor: 'crosshair',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #86efac 0%, #16A34A 60%, #92400E 100%)',
            border: '3px solid #E6A817',
            boxShadow: '0 8px 32px rgba(245,197,24,0.25)',
          }}
          title="Click anywhere to plant a sunflower!"
        >
          {/* Sky portion */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
              background: 'linear-gradient(180deg, #BAE6FD, #86EFAC)',
            }}
          />

          {/* Flowers */}
          {[...BASE_FLOWERS, ...extraFlowers].map((f) => (
            <GardenFlower key={f.id} {...f} />
          ))}

          {/* Click hint */}
          {extraFlowers.length === 0 && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                position: 'absolute', bottom: 10, left: 0, right: 0,
                textAlign: 'center', fontSize: '0.75rem',
                color: '#fff', fontWeight: 600, letterSpacing: 1,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
              }}
            >
              ✨ Click anywhere to plant more sunflowers!
            </motion.p>
          )}
        </div>

        <p className="mt-4 text-sm" style={{ color: '#92400E', opacity: 0.7 }}>
          {extraFlowers.length > 0
            ? `You've planted ${extraFlowers.length} more sunflower${extraFlowers.length > 1 ? 's' : ''} 🌻`
            : 'Click the garden to grow more flowers'}
        </p>
      </div>
    </section>
  );
}
