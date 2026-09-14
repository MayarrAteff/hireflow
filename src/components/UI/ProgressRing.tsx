import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useId } from 'react';

type ProgressRingProps = {
  /** 0 to 100. */
  value: number;
  size?: number;
  stroke?: number;
};

/** Circular progress drawn with the portal brand gradient; animates when the value changes. */
export function ProgressRing({ value, size = 112, stroke = 10 }: ProgressRingProps) {
  const { palette } = useTheme();
  const gradientId = useId();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-tw-rotate-90" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.primary.main} />
          <stop offset="1" stopColor={palette.secondary.main} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={palette.primary.main}
        strokeOpacity={0.14}
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  );
}
