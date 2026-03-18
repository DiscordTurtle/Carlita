import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import FloatingPetals from './FloatingPetals';
import SunflowerSVG from './SunflowerSVG';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FFFDE7 0%, #FFF9C4 40%, #FDE68A 100%)' }}
    >
      {/* Background floating petals */}
      <FloatingPetals count={28} />

      {/* Decorative blurred blobs */}
      <div
        aria-hidden="true"
        className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #F5C518, transparent)' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-16 right-8 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #FBBF24, transparent)' }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">

        {/* Spinning sunflower */}
        <motion.div
          className="flex justify-center mb-6"
          {...fadeUp(0.1)}
        >
          <div className="animate-rotate-slow" style={{ width: 110, height: 110 }}>
            <SunflowerSVG size={110} />
          </div>
        </motion.div>

        {/* Growtopia-style world entrance banner */}
        <motion.div
          {...fadeUp(0.25)}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '0.55rem',
            background: '#1a0a2e',
            color: '#F5C518',
            border: '3px solid #F5C518',
            boxShadow: '4px 4px 0 #92400E',
            lineHeight: 1.8,
          }}
        >
          <span style={{ color: '#4ade80' }}>▶</span>
          <span>WORLD: CARLA_AND_ME</span>
          <span className="animate-pixel-blink" style={{ color: '#4ade80' }}>_</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          {...fadeUp(0.4)}
          className="font-handwriting leading-tight mb-4"
          style={{ fontSize: 'clamp(3rem, 9vw, 6rem)', color: '#78350F' }}
        >
          For You, My{' '}
          <span style={{ color: '#E6A817' }}>Sunshine</span>
          <span className="ml-2">🌻</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.55)}
          className="text-lg md:text-xl leading-relaxed mb-2"
          style={{ color: '#92400E', maxWidth: '540px', margin: '0 auto 1rem' }}
        >
          To the girl who makes every ordinary day feel like a warm summer afternoon —
        </motion.p>
        <motion.p
          {...fadeUp(0.65)}
          className="font-handwriting text-2xl md:text-3xl mb-10"
          style={{ color: '#D97706' }}
        >
          this little corner of the internet is all yours.
        </motion.p>

        {/* CTA button */}
        <motion.div {...fadeUp(0.8)}>
          <a href="#story" className="btn-sunflower text-base md:text-lg inline-block">
            Come in → 🌻
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce-g cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
        title="Scroll down"
      >
        <ChevronDown size={36} strokeWidth={2.5} />
      </motion.div>

      {/* Corner sunflower decorations */}
      <div className="absolute top-4 right-4 opacity-20 animate-float-side">
        <SunflowerSVG size={60} />
      </div>
      <div className="absolute bottom-4 left-4 opacity-20 animate-float-side" style={{ animationDelay: '2s' }}>
        <SunflowerSVG size={45} />
      </div>
    </section>
  );
}
