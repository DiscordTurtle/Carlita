import { motion } from 'framer-motion';
import { useState } from 'react';

/* Wax seal SVG */
function WaxSeal({ opened }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
      style={{
        width: 64, height: 64, margin: '0 auto 24px',
        background: 'radial-gradient(circle at 40% 35%,#F87171,#DC2626)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(220,38,38,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
        cursor: opened ? 'default' : 'pointer',
      }}
    >
      <span style={{ fontSize: 28 }}>💌</span>
    </motion.div>
  );
}

/* Envelope open animation */
function Envelope({ onOpen, opened }) {
  return (
    <motion.div
      onClick={!opened ? onOpen : undefined}
      whileHover={!opened ? { scale: 1.03 } : {}}
      style={{
        background: 'linear-gradient(135deg,#FEF9C3,#FEF3C7)',
        border: '2px solid #F5C518',
        borderRadius: 12,
        padding: '2rem',
        maxWidth: 480,
        margin: '0 auto',
        cursor: opened ? 'default' : 'pointer',
        boxShadow: '0 8px 32px rgba(245,197,24,0.2)',
        userSelect: 'none',
      }}
    >
      <WaxSeal opened={opened} />
      {!opened ? (
        <p
          style={{
            textAlign: 'center',
            fontFamily: '"Dancing Script", cursive',
            fontSize: '1.4rem',
            color: '#92400E',
          }}
        >
          Click to open your letter 💛
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: '"Dancing Script", cursive', color: '#78350F', lineHeight: 2 }}
        >
          <p style={{ fontSize: '1.7rem', marginBottom: 16, textAlign: 'center' }}>My Dearest Carla,</p>

          <p style={{ fontSize: '1.15rem', marginBottom: 14 }}>
            I've been trying to find the right words for a while now — and I think that's
            because what I feel for you doesn't really fit inside a sentence.
          </p>

          <p style={{ fontSize: '1.15rem', marginBottom: 14 }}>
            Do you remember when we were kids, running worlds in Growtopia? We'd plant
            seeds and just&nbsp;<em>wait</em> — patient and hopeful — to see what would grow.
            That's a little bit how this feels. Something small, something ordinary,
            that quietly became the most important thing in my life.
          </p>

          <p style={{ fontSize: '1.15rem', marginBottom: 14 }}>
            You love sunflowers, and honestly that makes complete sense — you are one.
            You face every hard day with your chin up, chasing the light,
            and you bring warmth to every single person lucky enough to be near you.
            Your favourite colour is yellow. So is my heart now, apparently. 💛
          </p>

          <p style={{ fontSize: '1.15rem', marginBottom: 14 }}>
            Thank you for every laugh, every late night, every silly moment.
            Thank you for being the person I think of first and last each day.
          </p>

          <p style={{ fontSize: '1.15rem', marginBottom: 24 }}>
            This website is a small, dorky, very me way of saying:
            I love you more than pixels, more than gems, more than any world I could
            ever build — and I'm so incredibly grateful you're in mine. 🌻
          </p>

          <p style={{ fontSize: '1.4rem', textAlign: 'right' }}>
            Forever yours, <br />
            <span style={{ fontSize: '1.8rem' }}>Me 💛</span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function LoveLetter() {
  const [opened, setOpened] = useState(false);

  return (
    <section
      id="letter"
      className="py-24 px-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg,#FFFDE7 0%,#FEF3C7 50%,#FDE68A 100%)',
      }}
    >
      {/* Background sunflower watermark */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -60,
          right: -60,
          opacity: 0.07,
          pointerEvents: 'none',
          fontSize: 320,
          lineHeight: 1,
          transform: 'rotate(-20deg)',
          userSelect: 'none',
        }}
      >
        🌻
      </div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p style={{ color: '#92400E', letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: 8 }}>
            — A Letter For You —
          </p>
          <h2
            className="font-handwriting"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.6rem)', color: '#78350F' }}
          >
            From My Heart to Yours 💌
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Envelope opened={opened} onOpen={() => setOpened(true)} />
        </motion.div>

        {/* Open hint */}
        {!opened && (
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-center mt-4 text-sm"
            style={{ color: '#A16207' }}
          >
            ✉️ A letter is waiting for you…
          </motion.p>
        )}
      </div>
    </section>
  );
}
