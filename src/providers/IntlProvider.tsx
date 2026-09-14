import { IntlProvider } from 'react-intl';

import { localeMessages } from '@/constants/app';
import { useAppSelector } from '@/store/hooks';
import type { ChildProp } from '@/types/general.types';

export function AppIntlProvider({ children }: Readonly<ChildProp>) {
  const locale = useAppSelector((state) => state.appConfig.locale);

  return (
    <IntlProvider locale={locale} messages={localeMessages[locale]} defaultLocale="en">
      {children}
    </IntlProvider>
  );
}
