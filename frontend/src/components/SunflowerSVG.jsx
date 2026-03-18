/**
 * Animated SVG Sunflower component.
 * size  – pixel size (equal width/height)
 * bloom – if true the flower plays the bloom-in animation
 */
export default function SunflowerSVG({ size = 120, bloom = false, className = '' }) {
  const r = size / 2;
  const petalCount = 16;
  const petalAngles = Array.from({ length: petalCount }, (_, i) => (i * 360) / petalCount);

  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -60 120 120"
      className={`${bloom ? 'animate-bloom' : ''} ${className}`}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* Outer petals */}
      {petalAngles.map((angle, i) => (
        <ellipse
          key={`outer-${i}`}
          cx={0}
          cy={-38}
          rx={7}
          ry={16}
          fill={i % 2 === 0 ? '#F5C518' : '#E6A817'}
          transform={`rotate(${angle})`}
          opacity={0.9}
        />
      ))}

      {/* Inner petals (offset by half step) */}
      {petalAngles.map((angle, i) => (
        <ellipse
          key={`inner-${i}`}
          cx={0}
          cy={-30}
          rx={5}
          ry={12}
          fill="#FBBF24"
          transform={`rotate(${angle + 360 / petalCount / 2})`}
          opacity={0.7}
        />
      ))}

      {/* Dark brown center */}
      <circle cx={0} cy={0} r={20} fill="#78350F" />
      <circle cx={0} cy={0} r={16} fill="#92400E" />

      {/* Seed pattern dots */}
      {[
        [0, 0], [0, -9], [0, 9], [-9, 0], [9, 0],
        [-6, -6], [6, -6], [-6, 6], [6, 6],
        [0, -5], [0, 5], [-5, 0], [5, 0],
      ].map(([cx, cy], i) => (
        <circle key={`seed-${i}`} cx={cx} cy={cy} r={1.8} fill="#451A03" opacity={0.7} />
      ))}
    </svg>
  );
}
