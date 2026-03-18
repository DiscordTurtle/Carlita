import { motion } from 'framer-motion';
import SunflowerSVG from './SunflowerSVG';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(135deg,#1a0a2e,#2d1b4e)',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
      >
        {/* Rotating flower */}
        <div className="animate-rotate-slow" style={{ width: 64, height: 64 }}>
          <SunflowerSVG size={64} />
        </div>

        <p
          className="font-handwriting"
          style={{ fontSize: 'clamp(1.6rem,5vw,2.6rem)', color: '#F5C518', lineHeight: 1.3 }}
        >
          Made with love, for Carla 🌻
        </p>

        <p style={{ color: '#d1b4f8', fontSize: '0.9rem', maxWidth: 400 }}>
          From two kids planting seeds in Growtopia, to something real and wonderful.
          Thank you for being you. 💛
        </p>

        {/* Growtopia badge */}
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '0.42rem',
            background: '#1a0a2e',
            border: '2px solid #F5C518',
            boxShadow: '3px 3px 0 #92400E',
            color: '#F5C518',
            padding: '6px 12px',
            borderRadius: 4,
            lineHeight: 2,
          }}
        >
          WORLD: CARLA_AND_ME — PLAYERS: 2 — STATUS: IN LOVE ❤️
        </div>

        <p style={{ color: '#6b5a7e', fontSize: '0.75rem', marginTop: 8 }}>
          © {new Date().getFullYear()} — Built just for you ☀️
        </p>
      </motion.div>
    </footer>
  );
}
