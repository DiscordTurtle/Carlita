import { motion } from 'framer-motion';
import { useState } from 'react';

const REASONS = [
  { emoji: '☀️', title: 'Your smile', text: 'It can light up a room that has no windows. Honestly, it should be classified as renewable energy.' },
  { emoji: '🌻', title: 'Your love for sunflowers', text: "You're just like one — you always turn toward the light, and you bring warmth to everything around you." },
  { emoji: '🎮', title: 'Our shared stories', text: 'From planting pixel seeds in Growtopia to planting something real between us — I wouldn\'t trade a single memory.' },
  { emoji: '💛', title: 'Your favourite colour', text: 'Yellow. The colour of sunflowers, sunshine, and the way I feel whenever you\'re near me.' },
  { emoji: '🤣', title: 'Your laugh', text: "It's contagious, it's ridiculous, and it's my absolute favourite sound in the world." },
  { emoji: '🌙', title: 'Late nights', text: "The way time disappears when we're together — hours feel like minutes, and I'm never ready to say goodnight." },
  { emoji: '🌱', title: 'How you grow', text: 'You keep becoming more of yourself every single day. Watching you bloom is honestly the most beautiful thing I\'ve ever witnessed.' },
  { emoji: '🔑', title: 'You hold the key', text: "In Growtopia, someone always has to carry the World Lock. In real life, you've had the key to my heart since day one." },
];

function ReasonCard({ emoji, title, text, index }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={() => setFlipped((f) => !f)}
      style={{
        perspective: 800,
        cursor: 'pointer',
        height: 180,
      }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 140, damping: 18 }}
        style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg,#FEF9C3,#FDE68A)',
            border: '2px solid #F5C518',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(245,197,24,0.25)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '1.2rem',
          }}
        >
          <span style={{ fontSize: 40 }}>{emoji}</span>
          <p style={{ fontWeight: 700, color: '#78350F', fontSize: '1rem', textAlign: 'center' }}>{title}</p>
          <p style={{ fontSize: '0.65rem', color: '#92400E', opacity: 0.7 }}>tap to read ✨</p>
        </div>

        {/* Back */}
        <div
          style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg,#F5C518,#E6A817)',
            border: '2px solid #92400E',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(230,168,23,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.2rem',
          }}
        >
          <p style={{ color: '#1C1917', fontSize: '0.85rem', lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic' }}>
            "{text}"
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WhyILoveYou() {
  return (
    <section
      id="reasons"
      className="py-24 px-6"
      style={{ background: 'linear-gradient(180deg,#FDE68A 0%,#FFFDE7 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p style={{ color: '#92400E', letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: 8 }}>
            — The Real Reasons —
          </p>
          <h2
            className="font-handwriting"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: '#78350F' }}
          >
            Why You Are My Sunshine ☀️
          </h2>
          <p className="mt-3 text-base" style={{ color: '#A16207', maxWidth: 480, margin: '0.75rem auto 0' }}>
            Tap each card to reveal a reason. (There are infinite more where these came from.)
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {REASONS.map((r, i) => (
            <ReasonCard key={r.title} {...r} index={i} />
          ))}
        </div>

        {/* Bottom heart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="text-center mt-16"
        >
          <span
            className="animate-heartbeat inline-block"
            style={{ fontSize: 64 }}
          >
            ❤️
          </span>
          <p
            className="font-handwriting mt-3"
            style={{ fontSize: 'clamp(1.4rem,4vw,2.2rem)', color: '#78350F' }}
          >
            And a thousand more reasons besides…
          </p>
        </motion.div>
      </div>
    </section>
  );
}
