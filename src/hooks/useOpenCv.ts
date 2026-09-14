import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import { getCvUrl } from '@/services/profile.service';
import { getErrorMessage } from '@/utils/hooks/useFormMutation';

/** Opens a stored CV through a short-lived signed link. */
export function useOpenCv() {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  // Open the tab synchronously so pop-up blockers allow it, then point it at the signed link.
  const openCv = async (path: string) => {
    const tab = window.open('', '_blank');
    setOpeningPath(path);
    try {
      const url = await getCvUrl(path);
      if (tab) tab.location.href = url;
    } catch (error) {
      tab?.close();
      enqueueSnackbar(getErrorMessage(error) ?? $t({ id: 'error.generic.title' }), { variant: 'error' });
    } finally {
      setOpeningPath(null);
    }
  };

  return { openCv, openingPath };
}
