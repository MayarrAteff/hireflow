import { createIntl, createIntlCache } from 'react-intl';

import { localeMessages } from '@/constants/app';
import { store } from '@/store';

const cache = createIntlCache();

/** Translate outside React components (interceptors, services). */
export function getTranslation(id: string, values?: Record<string, string | number>) {
  const locale = store.getState().appConfig.locale;
  const intl = createIntl({ locale, messages: localeMessages[locale] }, cache);
  return intl.formatMessage({ id }, values);
}
