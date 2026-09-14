import type { Theme, ThemeOptions } from '@mui/material/styles';

export function ComponentsOverrides(theme: Theme): ThemeOptions['components'] {
  return {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: theme.spacing(2.5) },
        sizeLarge: { paddingBlock: theme.spacing(1.25) },
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
        root: { border: `1px solid ${theme.palette.divider}` },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
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
          borderRadius: 10,
          '&.active': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.palette.primary.light,
            color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.primary.main,
            '& .MuiListItemIcon-root': { color: 'inherit' },
          },
        },
      },
    },
  };
}
