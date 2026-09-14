import Box from '@mui/material/Box';
import { alpha, keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import { useIntl } from 'react-intl';

import { brandGradient } from '@/styles/themes/accents';

type LoadingPageProps = {
  /** Fill the whole viewport (initial app boot) instead of the content area. */
  fullScreen?: boolean;
};

const CYCLE = '2.4s';

// Delayed so quick loads never flash the loader.
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
`;

// Strokes draw in, hold, then wipe out forwards before the next cycle.
const draw = keyframes`
  0% { stroke-dashoffset: 1; }
  35%, 75% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -1; }
`;

const pop = keyframes`
  0%, 30% { transform: scale(0); }
  42% { transform: scale(1.25); }
  50%, 78% { transform: scale(1); }
  90%, 100% { transform: scale(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(0.85); opacity: 0.45; }
  50% { transform: scale(1.15); opacity: 0.8; }
`;

const slide = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
`;

/** Branded loader: the HireFlow mark drawing itself in the active portal's colours. */
export function LoadingPage({ fullScreen = false }: LoadingPageProps) {
  const { $t } = useIntl();
  // useId returns `:r0:`, which is not a valid `url(#…)` reference.
  const gradientId = `loader-gradient-${useId().replace(/:/g, '')}`;

  const strokeSx = (delay: string) => ({
    strokeDasharray: 1,
    strokeDashoffset: 1,
    animation: `${draw} ${CYCLE} cubic-bezier(0.65, 0, 0.35, 1) ${delay} infinite`,
  });

  return (
    <Box
      role="status"
      aria-live="polite"
      className={`flex w-full flex-col items-center justify-center gap-5 ${fullScreen ? 'min-h-screen' : 'min-h-[60vh]'}`}
      sx={{
        animation: `${fadeIn} 400ms ease-out 200ms both`,
        '@media (prefers-reduced-motion: reduce)': {
          '&, & *': { animation: 'none !important' },
          '& path': { strokeDashoffset: 0 },
          '& circle': { transform: 'none' },
        },
      }}
    >
      <Box className="relative flex h-24 w-24 items-center justify-center">
        <Box
          aria-hidden
          className="absolute inset-0 rounded-3xl blur-xl"
          sx={(theme) => ({
            background: brandGradient(theme),
            animation: `${pulse} ${CYCLE} ease-in-out infinite`,
          })}
        />
        <Box
          component="svg"
          viewBox="0 0 64 64"
          aria-hidden
          className="relative h-16 w-16"
          sx={(theme) => ({ filter: `drop-shadow(0 8px 20px ${alpha(theme.palette.primary.main, 0.35)})` })}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Box component="stop" offset="0" sx={{ stopColor: (theme) => theme.palette.primary.main }} />
              <Box component="stop" offset="1" sx={{ stopColor: (theme) => theme.palette.secondary.main }} />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
          <g fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round">
            <Box component="path" d="M18 18v28" pathLength={1} sx={strokeSx('0s')} />
            <Box component="path" d="M46 18v28" pathLength={1} sx={strokeSx('0.15s')} />
            <Box component="path" d="M18 32h28" pathLength={1} sx={strokeSx('0.3s')} />
          </g>
          <Box
            component="circle"
            cx="46"
            cy="18"
            r="5"
            fill="#FBBF24"
            sx={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animation: `${pop} ${CYCLE} ease-out infinite`,
            }}
          />
        </Box>
      </Box>

      <Box className="flex flex-col items-center gap-3">
        <Typography variant="h6" component="span" className="font-semibold tracking-wide">
          {$t({ id: 'app.name' })}
        </Typography>
        <Box
          aria-hidden
          className="relative h-1 w-32 overflow-hidden rounded-full"
          sx={(theme) => ({ bgcolor: alpha(theme.palette.primary.main, 0.15) })}
        >
          <Box
            className="absolute inset-y-0 w-2/5 rounded-full"
            sx={(theme) => ({
              background: brandGradient(theme, 90),
              animation: `${slide} 1.2s ease-in-out infinite`,
            })}
          />
        </Box>
        <span className="sr-only">{$t({ id: 'app.loading' })}</span>
      </Box>
    </Box>
  );
}
