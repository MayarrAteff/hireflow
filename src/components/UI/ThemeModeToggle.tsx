import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { toggleThemeMode } from '@/store/features/appConfigSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function ThemeModeToggle() {
  const { $t } = useIntl();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.appConfig.themeMode === 'dark');
  const label = $t({ id: isDark ? 'header.lightMode' : 'header.darkMode' });

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" aria-label={label} onClick={() => dispatch(toggleThemeMode())}>
        {isDark ? <MdLightMode /> : <MdDarkMode />}
      </IconButton>
    </Tooltip>
  );
}
