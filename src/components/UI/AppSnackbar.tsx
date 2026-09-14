import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { alpha, keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { type CustomContentProps, SnackbarContent, useSnackbar, type VariantType } from 'notistack';
import { forwardRef } from 'react';
import type { IconType } from 'react-icons';
import { MdCheckCircle, MdClose, MdError, MdInfo, MdNotifications, MdWarning } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ACCENT_COLORS } from '@/styles/themes/accents';

const variants: Record<VariantType, { icon: IconType; color: string; titleId: string }> = {
  success: { icon: MdCheckCircle, color: ACCENT_COLORS.emerald, titleId: 'snackbar.success' },
  error: { icon: MdError, color: ACCENT_COLORS.rose, titleId: 'snackbar.error' },
  warning: { icon: MdWarning, color: ACCENT_COLORS.amber, titleId: 'snackbar.warning' },
  info: { icon: MdInfo, color: ACCENT_COLORS.sky, titleId: 'snackbar.info' },
  default: { icon: MdNotifications, color: ACCENT_COLORS.violet, titleId: 'snackbar.default' },
};

const shrink = keyframes`
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
`;

const popIn = keyframes`
  0% { transform: scale(0.6) rotate(-12deg); }
  60% { transform: scale(1.12) rotate(4deg); }
  100% { transform: scale(1) rotate(0); }
`;

/** Card-style toast used for every notistack variant: coloured icon, title, message, optional action and a countdown bar. */
export const AppSnackbar = forwardRef<HTMLDivElement, CustomContentProps>(function AppSnackbar(
  { id, message, variant, autoHideDuration, persist, style, className, action },
  ref,
) {
  const { $t } = useIntl();
  const { closeSnackbar } = useSnackbar();
  const { icon: Icon, color, titleId } = variants[variant];
  const showCountdown = !persist && Boolean(autoHideDuration);

  return (
    <SnackbarContent ref={ref} role={variant === 'error' ? 'alert' : 'status'} style={style} className={className}>
      <Box
        className="tw-relative tw-flex tw-w-full tw-items-start tw-gap-3 tw-overflow-hidden tw-rounded-2xl tw-p-3.5 tw-pe-2 sm:tw-w-[380px]"
        sx={(theme) => ({
          bgcolor: 'background.paper',
          border: `1px solid ${alpha(color, 0.3)}`,
          borderInlineStart: `4px solid ${color}`,
          backgroundImage: `linear-gradient(90deg, ${alpha(color, theme.palette.mode === 'dark' ? 0.16 : 0.1)} 0%, transparent 60%)`,
          boxShadow: `0 18px 40px -16px ${alpha(color, 0.45)}, 0 2px 6px rgba(0,0,0,0.06)`,
          '&:hover .snackbar-countdown': { animationPlayState: 'paused' },
        })}
      >
        <Box
          className="tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl"
          sx={{
            bgcolor: color,
            color: '#fff',
            boxShadow: `0 6px 14px -4px ${alpha(color, 0.6)}`,
            animation: `${popIn} 420ms ease-out`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          <Icon size={22} />
        </Box>

        <Box className="tw-min-w-0 tw-flex-1 tw-pt-0.5">
          <Typography fontWeight={700} className="tw-leading-snug">
            {$t({ id: titleId })}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="tw-break-words">
            {message}
          </Typography>
        </Box>

        {action && (
          <Box className="tw-shrink-0 tw-self-center">{typeof action === 'function' ? action(id) : action}</Box>
        )}

        <IconButton size="small" aria-label={$t({ id: 'snackbar.close' })} onClick={() => closeSnackbar(id)}>
          <MdClose size={18} />
        </IconButton>

        {showCountdown && (
          <Box
            aria-hidden
            className="snackbar-countdown tw-absolute tw-inset-x-0 tw-bottom-0 tw-h-[3px]"
            sx={{
              bgcolor: alpha(color, 0.7),
              transformOrigin: 'var(--countdown-origin)',
              animation: `${shrink} ${autoHideDuration}ms linear forwards`,
              '[dir="ltr"] &': { '--countdown-origin': 'left' },
              '[dir="rtl"] &': { '--countdown-origin': 'right' },
            }}
          />
        )}
      </Box>
    </SnackbarContent>
  );
});
