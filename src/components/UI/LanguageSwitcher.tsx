import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { MdCheck, MdKeyboardArrowDown, MdLanguage } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { setLocale } from '@/store/features/appConfigSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Locale } from '@/types/general.types';

/** Each language is listed in its own script and font, whatever the active locale is. */
const languages: { locale: Locale; fontFamily: string }[] = [
  { locale: 'en', fontFamily: `'Poppins', sans-serif` },
  { locale: 'ar', fontFamily: `'Cairo', sans-serif` },
];

export function LanguageSwitcher() {
  const { $t } = useIntl();
  const dispatch = useAppDispatch();
  const locale = useAppSelector((state) => state.appConfig.locale);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleSelect = (next: Locale) => {
    setAnchorEl(null);
    if (next !== locale) dispatch(setLocale(next));
  };

  return (
    <>
      <Button
        color="inherit"
        size="small"
        aria-label={$t({ id: 'header.language' })}
        aria-haspopup="menu"
        aria-expanded={open}
        startIcon={<MdLanguage />}
        endIcon={<MdKeyboardArrowDown className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={(theme) => ({
          border: 1,
          borderColor: open ? 'primary.main' : 'divider',
          borderRadius: 99,
          paddingInline: 1.5,
          bgcolor: open ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
          '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) },
        })}
      >
        {$t({ id: `language.${locale}` })}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: 'mt-1 min-w-44' } }}
      >
        {languages.map(({ locale: option, fontFamily }) => (
          <MenuItem
            key={option}
            lang={option}
            selected={option === locale}
            onClick={() => handleSelect(option)}
            className="mx-1 rounded-lg"
          >
            <ListItemText slotProps={{ primary: { sx: { fontFamily, fontWeight: option === locale ? 600 : 400 } } }}>
              {$t({ id: `language.${option}` })}
            </ListItemText>
            {option === locale && (
              <ListItemIcon sx={{ color: 'primary.main', justifyContent: 'flex-end' }}>
                <MdCheck />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
