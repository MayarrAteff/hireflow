import { alpha, type Theme, type ThemeOptions } from '@mui/material/styles';

import { brandGradient } from './accents';

export function ComponentsOverrides(theme: Theme): ThemeOptions['components'] {
  const isDark = theme.palette.mode === 'dark';
  const brandShadow = `0 8px 20px -8px ${alpha(theme.palette.primary.main, 0.6)}`;

  return {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: theme.spacing(2.5) },
        sizeLarge: { paddingBlock: theme.spacing(1.25) },
        containedPrimary: {
          background: brandGradient(theme),
          boxShadow: brandShadow,
          transition: theme.transitions.create(['filter', 'transform', 'box-shadow']),
          '&:hover': { background: brandGradient(theme), filter: 'brightness(1.08)', transform: 'translateY(-1px)' },
          '&.Mui-disabled': { background: theme.palette.action.disabledBackground, boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 16 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: isDark
            ? '0 12px 32px -20px rgba(0,0,0,0.6)'
            : `0 1px 2px rgba(30,27,58,0.04), 0 12px 32px -20px ${alpha(theme.palette.primary.main, 0.35)}`,
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          transition: theme.transitions.create('background-color'),
          '&:hover .MuiCardActionArea-focusHighlight': { opacity: 0.04 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 8, borderRadius: 99, backgroundColor: alpha(theme.palette.primary.main, 0.14) },
        bar: { borderRadius: 99, background: brandGradient(theme, 90) },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: theme.palette.text.secondary, whiteSpace: 'nowrap' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { borderRadius: 12, textTransform: 'none' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: theme.transitions.create(['background-color', 'box-shadow']),
          '&.active': {
            background: brandGradient(theme),
            color: theme.palette.common.white,
            boxShadow: brandShadow,
            '& .MuiListItemIcon-root': { color: 'inherit' },
          },
        },
      },
    },
  };
}
