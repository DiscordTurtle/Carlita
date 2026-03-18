import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SunflowerSVG from './SunflowerSVG';

const NAV_LINKS = [
  { href: '#home',    label: 'Home'       },
  { href: '#story',   label: 'Our Story'  },
  { href: '#garden',  label: 'Garden'     },
  { href: '#reasons', label: 'Reasons'    },
  { href: '#letter',  label: 'Letter'     },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'background 0.3s, backdrop-filter 0.3s, box-shadow 0.3s',
        background: scrolled ? 'rgba(255,253,231,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 2px 16px rgba(245,197,24,0.2)' : 'none',
      }}
    >
      <nav style={{ maxWidth: 1024, margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => { e.preventDefault(); handleNav('#home'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <div className="animate-rotate-slow" style={{ width: 32, height: 32 }}>
            <SunflowerSVG size={32} />
          </div>
          <span
            style={{
              fontFamily: '"Dancing Script", cursive',
              fontSize: '1.4rem',
              color: '#78350F',
              fontWeight: 700,
            }}
          >
            For Carla 💛
          </span>
        </a>

        {/* Desktop links */}
        <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }} className="hidden md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
                style={{
                  textDecoration: 'none',
                  color: '#78350F',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  transition: 'color 0.2s',
                  padding: '4px 8px',
                  borderRadius: 6,
                }}
                onMouseEnter={(e) => (e.target.style.color = '#E6A817')}
                onMouseLeave={(e) => (e.target.style.color = '#78350F')}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#78350F', fontSize: 24, lineHeight: 1,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile flyout */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              overflow: 'hidden',
              background: 'rgba(255,253,231,0.97)',
              borderTop: '1px solid #FDE68A',
            }}
          >
            <ul style={{ listStyle: 'none', padding: '1rem 1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNav(link.href); }}
                    style={{ textDecoration: 'none', color: '#78350F', fontWeight: 600, fontSize: '1rem' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
