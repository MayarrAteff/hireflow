import Button from '@mui/material/Button';
import { MdTranslate } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { setLocale } from '@/store/features/appConfigSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function LanguageSwitcher() {
  const { $t } = useIntl();
  const dispatch = useAppDispatch();
  const locale = useAppSelector((state) => state.appConfig.locale);

  return (
    <Button
      color="inherit"
      startIcon={<MdTranslate />}
      onClick={() => dispatch(setLocale(locale === 'en' ? 'ar' : 'en'))}
    >
      {$t({ id: 'header.language' })}
    </Button>
  );
}
