import { motion } from 'framer-motion';
import { useState } from 'react';

/* ── Pixel-art tile colours mimicking Growtopia's world builder ── */
const SKY   = '#5B96F7';
const CLOUD = '#DDEEFF';
const DIRT  = '#8B6343';
const GRASS = '#4CAF50';
const WOOD  = '#6D4C24';
const LEAF  = '#2E7D32';
const SUN_Y = '#F5C518';
const SUN_C = '#92400E';

/* A tiny "pixel art" sunflower rendered with CSS grid squares */
function PixelSunflower({ grown }) {
  // 9×12 pixel grid  (row-major, top-to-bottom)
  // 0=sky, 1=petal, 2=center, 3=stem, 4=leaf
  const grid = [
    [0, 1, 1, 1, 0],
    [1, 1, 2, 1, 1],
    [1, 2, 2, 2, 1],
    [1, 1, 2, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 3, 0, 0],
    [0, 4, 3, 0, 0],
    [0, 0, 3, 4, 0],
    [0, 0, 3, 0, 0],
  ];
  const colorMap = { 0: 'transparent', 1: SUN_Y, 2: SUN_C, 3: GRASS, 4: LEAF };
  const px = 8;

  return (
    <motion.div
      style={{ display: 'grid', gridTemplateColumns: `repeat(5, ${px}px)`, imageRendering: 'pixelated' }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={grown ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {grid.flat().map((cell, i) => (
        <div
          key={i}
          style={{ width: px, height: px, background: colorMap[cell] }}
        />
      ))}
    </motion.div>
  );
}

/* Growtopia-style item box */
function ItemBox({ emoji, label, color = '#F5C518' }) {
  return (
    <div
      style={{
        background: '#2a1a4e',
        border: `3px solid ${color}`,
        boxShadow: `3px 3px 0 #000`,
        borderRadius: 4,
        padding: '6px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        minWidth: 64,
      }}
    >
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.38rem', color, textAlign: 'center', lineHeight: 1.6 }}>
        {label}
      </span>
    </div>
  );
}

/* Achievement popup */
function Achievement({ text, icon, visible }) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={visible ? { x: 0, opacity: 1 } : { x: 300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: '#1a0a2e',
        border: '3px solid #F5C518',
        boxShadow: '4px 4px 0 #92400E',
        borderRadius: 6,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 20,
      }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.38rem', color: '#F5C518', marginBottom: 4 }}>
          ACHIEVEMENT UNLOCKED
        </p>
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem', color: '#fff' }}>
          {text}
        </p>
      </div>
    </motion.div>
  );
}

export default function GrowtopiaSection() {
  const [seedPlanted, setSeedPlanted] = useState(false);
  const [grown, setGrown] = useState(false);
  const [achievement, setAchievement] = useState(false);

  const plantSeed = () => {
    if (grown) return;
    setSeedPlanted(true);
    setTimeout(() => {
      setGrown(true);
      setTimeout(() => setAchievement(true), 600);
    }, 800);
  };

  return (
    <section
      id="story"
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#1a0a2e 0%,#2d1b4e 100%)' }}
    >
      {/* Pixel star field background */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 100}%`,
            width: Math.random() > 0.5 ? 3 : 2,
            height: Math.random() > 0.5 ? 3 : 2,
            background: '#FBBF24',
            imageRendering: 'pixelated',
            opacity: Math.random() * 0.6 + 0.3,
            animation: `pixelBlink ${1 + Math.random() * 2}s step-end infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem', color: '#4ade80', marginBottom: 12, letterSpacing: 2 }}
          >
            — LOADING WORLD: CARLA_AND_ME —
          </p>
          <h2
            className="font-handwriting"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: '#F5C518', lineHeight: 1.2 }}
          >
            Remember When We Built Worlds Together?
          </h2>
          <p className="mt-4 text-base md:text-lg" style={{ color: '#d1b4f8', maxWidth: 540, margin: '1rem auto 0' }}>
            Two kids, two phones, the same silly game — neither of us knew we were building something
            far more important than a Growtopia world.
          </p>
        </motion.div>

        {/* Two-column layout: story + interactive world */}
        <div className="grid md:grid-cols-2 gap-10 items-start">

          {/* Left: Story timeline */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            {[
              {
                icon: '🌱',
                title: 'CHAPTER 01',
                titleColor: '#4ade80',
                text: 'We started playing Growtopia. Trading seeds, growing trees, building tiny pixel worlds side by side.',
              },
              {
                icon: '🌻',
                title: 'CHAPTER 02',
                titleColor: '#F5C518',
                text: 'Out of all the seeds we ever planted together, you turned out to be the rarest one — a sunflower that keeps growing.',
              },
              {
                icon: '💎',
                title: 'CHAPTER 03',
                titleColor: '#60A5FA',
                text: 'I traded virtual gems back then. Now I know the real gem was always right next to me.',
              },
              {
                icon: '❤️',
                title: 'CHAPTER 04',
                titleColor: '#F87171',
                text: "Every world we built had a door — and somehow, you're the one who holds the lock to mine.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(245,197,24,0.25)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{item.icon}</span>
                <div>
                  <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem', color: item.titleColor, marginBottom: 6 }}>
                    {item.title}
                  </p>
                  <p style={{ color: '#e2d9f3', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Interactive Growtopia world panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Achievement text="FOUND MY PLAYER 2 ♥" icon="❤️" visible={achievement} />

            {/* World window frame */}
            <div
              style={{
                background: '#1a0a2e',
                border: '4px solid #F5C518',
                boxShadow: '6px 6px 0 #92400E',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {/* Title bar */}
              <div
                style={{
                  background: '#F5C518',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem', color: '#1C1917', flex: 1, textAlign: 'center' }}>
                  CARLA_AND_ME
                </p>
              </div>

              {/* SVG pixel-art mini world */}
              <svg
                viewBox="0 0 160 100"
                width="100%"
                style={{ imageRendering: 'pixelated', display: 'block', background: SKY }}
              >
                {/* Sky gradient */}
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#93C5FD" />
                  </linearGradient>
                </defs>
                <rect width="160" height="100" fill="url(#skyGrad)" />

                {/* Clouds */}
                <rect x="10"  y="10" width="24" height="8"  rx="4" fill={CLOUD} opacity=".8" />
                <rect x="18"  y="6"  width="12" height="8"  rx="4" fill={CLOUD} opacity=".9" />
                <rect x="100" y="15" width="30" height="8"  rx="4" fill={CLOUD} opacity=".7" />

                {/* Ground layers */}
                <rect x="0"  y="78" width="160" height="6"  fill={GRASS} />
                <rect x="0"  y="84" width="160" height="16" fill={DIRT}  />

                {/* Wood tree left */}
                <rect x="18" y="46" width="8"  height="32" fill={WOOD}  />
                <rect x="8"  y="30" width="28" height="24" fill={LEAF} rx="3" />

                {/* Wood tree right */}
                <rect x="130" y="52" width="8"  height="26" fill={WOOD}  />
                <rect x="120" y="36" width="28" height="24" fill={LEAF} rx="3" />

                {/* Sunflower stem */}
                {grown && (
                  <g>
                    <rect x="78" y="54" width="4" height="24" fill={GRASS} />
                    {/* petals */}
                    {[[-8,-8],[0,-10],[8,-8],[10,0],[8,8],[0,10],[-8,8],[-10,0]].map(([dx,dy],i) => (
                      <rect key={i} x={78+dx} y={54+dy} width="6" height="6" rx="1" fill={SUN_Y} />
                    ))}
                    {/* center */}
                    <rect x="75" y="51" width="10" height="10" rx="2" fill={SUN_C} />
                  </g>
                )}

                {/* Seed / soil spot */}
                {!grown && (
                  <rect x="78" y="74" width="6" height="4" rx="1" fill={seedPlanted ? '#4ade80' : DIRT} />
                )}

                {/* Player 1 pixel character (brown hair, yellow shirt) */}
                {/* Head */}
                <rect x="48" y="58" width="10" height="10" rx="1" fill="#FBBF24" />
                {/* Hair */}
                <rect x="48" y="56" width="10" height="4" rx="1" fill="#92400E" />
                {/* Body */}
                <rect x="46" y="68" width="14" height="10" fill="#3B82F6" />
                {/* Legs */}
                <rect x="47" y="78" width="4" height="4" fill="#1E40AF" />
                <rect x="53" y="78" width="4" height="4" fill="#1E40AF" />
                {/* Label */}
                <text x="53" y="53" textAnchor="middle" fill="#fff" fontSize="4" fontFamily="monospace">ME</text>

                {/* Player 2 pixel character (blonde, pink shirt) */}
                {/* Head */}
                <rect x="102" y="58" width="10" height="10" rx="1" fill="#FBBF24" />
                {/* Hair */}
                <rect x="102" y="55" width="10" height="5" rx="1" fill="#F5C518" />
                {/* Body */}
                <rect x="100" y="68" width="14" height="10" fill="#EC4899" />
                {/* Legs */}
                <rect x="101" y="78" width="4" height="4" fill="#9D174D" />
                <rect x="107" y="78" width="4" height="4" fill="#9D174D" />
                {/* Label */}
                <text x="107" y="53" textAnchor="middle" fill="#fff" fontSize="4" fontFamily="monospace">CARLA</text>

                {/* Hearts between them when grown */}
                {grown && (
                  <>
                    <text x="80" y="65" textAnchor="middle" fill="#F87171" fontSize="10">♥</text>
                  </>
                )}
              </svg>

              {/* Item tray */}
              <div style={{ padding: 12, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <ItemBox emoji="🌻" label="SUNFLOWER" color="#F5C518" />
                <ItemBox emoji="💛" label="YELLOW GEM" color="#FDE68A" />
                <ItemBox emoji="🔑" label="HEART KEY"  color="#F87171" />
                <ItemBox emoji="🌱" label="LOVE SEED"  color="#4ade80" />
              </div>

              {/* Plant button */}
              <div style={{ padding: '0 12px 16px', textAlign: 'center' }}>
                <button
                  onClick={plantSeed}
                  disabled={grown}
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '0.45rem',
                    background: grown ? '#333' : '#F5C518',
                    color: grown ? '#888' : '#1C1917',
                    border: `3px solid ${grown ? '#555' : '#92400E'}`,
                    boxShadow: grown ? 'none' : '3px 3px 0 #92400E',
                    padding: '8px 16px',
                    borderRadius: 3,
                    cursor: grown ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {grown ? '✓ SUNFLOWER GROWN!' : '🌱 PLANT SUNFLOWER SEED'}
                </button>
              </div>
            </div>

            {/* Gem counter */}
            <div
              className="mt-4 text-center"
              style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.45rem', color: '#FBBF24' }}
            >
              💎 LOVE GEMS: <span style={{ color: '#4ade80' }}>∞</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
