import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useId } from 'react';

import { ACCENT_COLORS } from '@/styles/themes/accents';

type IllustrationProps = {
  className?: string;
};

const float = (delay = 0, distance = 6) => ({
  animate: { y: [0, -distance, 0] },
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay },
});

function Sparkle({ x, y, size = 8, fill }: { x: number; y: number; size?: number; fill: string }) {
  const s = size / 2;
  return (
    <path
      d={`M${x} ${y - s} Q${x + s * 0.2} ${y - s * 0.2} ${x + s} ${y} Q${x + s * 0.2} ${y + s * 0.2} ${x} ${y + s} Q${x - s * 0.2} ${y + s * 0.2} ${x - s} ${y} Q${x - s * 0.2} ${y - s * 0.2} ${x} ${y - s}Z`}
      fill={fill}
    />
  );
}

/** Hiring board with floating stats; drawn in white so it sits on the brand gradient. */
export function HiringIllustration({ className }: IllustrationProps) {
  const { palette } = useTheme();
  const rows = [
    { color: ACCENT_COLORS.amber, width: 86, checked: true },
    { color: ACCENT_COLORS.emerald, width: 64, checked: false },
    { color: ACCENT_COLORS.sky, width: 76, checked: false },
  ];

  return (
    <svg viewBox="0 0 320 220" className={className} aria-hidden>
      <circle cx="170" cy="110" r="96" fill="#fff" opacity="0.1" />
      <circle cx="170" cy="110" r="64" fill="#fff" opacity="0.08" />

      <motion.g {...float(0, 5)}>
        <rect x="70" y="38" width="190" height="150" rx="18" fill="#fff" />
        <rect x="88" y="56" width="70" height="10" rx="5" fill={palette.primary.main} opacity="0.85" />
        {rows.map((row, index) => {
          const y = 84 + index * 32;
          return (
            <g key={row.color}>
              <circle cx="102" cy={y + 10} r="11" fill={row.color} />
              <rect x="122" y={y + 2} width={row.width} height="7" rx="3.5" fill="#1E1B3A" opacity="0.18" />
              <rect x="122" y={y + 13} width={row.width - 24} height="6" rx="3" fill="#1E1B3A" opacity="0.09" />
              {row.checked && (
                <g>
                  <circle cx="236" cy={y + 10} r="10" fill={ACCENT_COLORS.emerald} />
                  <path
                    d={`M231 ${y + 10} l3.5 3.5 l6.5 -7`}
                    stroke="#fff"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          );
        })}
      </motion.g>

      <motion.g {...float(0.8, 8)}>
        <rect x="222" y="8" width="92" height="62" rx="14" fill="#fff" />
        {[18, 30, 24, 40].map((height, index) => (
          <rect
            key={height}
            x={236 + index * 17}
            y={58 - height}
            width="10"
            height={height}
            rx="3"
            fill={index === 3 ? palette.secondary.main : palette.primary.main}
            opacity={index === 3 ? 1 : 0.35 + index * 0.15}
          />
        ))}
      </motion.g>

      <motion.g {...float(1.6, 7)}>
        <rect x="14" y="150" width="112" height="46" rx="14" fill="#fff" />
        <rect x="26" y="162" width="22" height="22" rx="6" fill={ACCENT_COLORS.pink} />
        <path d="M31 173h12M37 167v12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="56" y="165" width="56" height="7" rx="3.5" fill="#1E1B3A" opacity="0.18" />
        <rect x="56" y="176" width="38" height="6" rx="3" fill="#1E1B3A" opacity="0.09" />
      </motion.g>

      <Sparkle x={40} y={48} size={14} fill="#fff" />
      <Sparkle x={292} y={112} size={12} fill={ACCENT_COLORS.amber} />
      <Sparkle x={60} y={112} size={8} fill="#fff" />
      <Sparkle x={200} y={206} size={10} fill="#fff" />
    </svg>
  );
}

/** Briefcase with sparkles for "no jobs yet" states. */
export function EmptyJobsIllustration({ className }: IllustrationProps) {
  const { palette } = useTheme();
  const gradientId = useId();

  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.primary.main} />
          <stop offset="1" stopColor={palette.secondary.main} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="84" r="66" fill={palette.primary.main} opacity="0.1" />
      <motion.g {...float()}>
        <rect x="78" y="42" width="44" height="24" rx="8" fill="none" stroke={palette.primary.main} strokeWidth="7" />
        <rect x="50" y="58" width="100" height="70" rx="16" fill={`url(#${gradientId})`} />
        <rect x="50" y="84" width="100" height="8" fill="#fff" opacity="0.2" />
        <rect x="90" y="80" width="20" height="16" rx="5" fill="#fff" />
      </motion.g>
      <motion.g {...float(1, 4)}>
        <circle cx="152" cy="54" r="15" fill={ACCENT_COLORS.emerald} />
        <path d="M146 54h12M152 48v12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      <Sparkle x={40} y={44} size={14} fill={ACCENT_COLORS.amber} />
      <Sparkle x={168} y={118} size={10} fill={ACCENT_COLORS.pink} />
      <Sparkle x={32} y={120} size={8} fill={ACCENT_COLORS.sky} />
    </svg>
  );
}

/** Office building for the company setup step. */
export function CompanyIllustration({ className }: IllustrationProps) {
  const { palette } = useTheme();
  const gradientId = useId();

  return (
    <svg viewBox="0 0 200 160" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.primary.main} />
          <stop offset="1" stopColor={palette.secondary.main} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="86" r="66" fill={palette.primary.main} opacity="0.1" />
      <rect x="30" y="136" width="140" height="6" rx="3" fill={palette.primary.main} opacity="0.2" />
      <motion.g {...float(0, 4)}>
        <rect x="66" y="40" width="68" height="98" rx="10" fill={`url(#${gradientId})`} />
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2].map((column) => (
            <rect
              key={`${row}-${column}`}
              x={76 + column * 18}
              y={52 + row * 18}
              width="11"
              height="10"
              rx="2.5"
              fill="#fff"
              opacity={(row + column) % 3 === 0 ? 0.95 : 0.55}
            />
          )),
        )}
        <rect x="91" y="118" width="18" height="20" rx="4" fill="#fff" />
        <path d="M100 40V18" stroke={palette.text.primary} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path d="M100 18h20l-5 6 5 6h-20z" fill={ACCENT_COLORS.amber} />
      </motion.g>
      <circle cx="44" cy="118" r="14" fill={ACCENT_COLORS.emerald} />
      <circle cx="54" cy="108" r="10" fill={ACCENT_COLORS.emerald} opacity="0.75" />
      <rect x="45" y="124" width="4" height="14" rx="2" fill={ACCENT_COLORS.emerald} />
      <Sparkle x={156} y={52} size={14} fill={ACCENT_COLORS.pink} />
      <Sparkle x={160} y={104} size={9} fill={ACCENT_COLORS.sky} />
    </svg>
  );
}
