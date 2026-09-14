import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import { getOfferLetterUrl } from '@/services/offers.service';
import { getCvUrl } from '@/services/profile.service';
import { getErrorMessage } from '@/utils/hooks/useFormMutation';

/** Opens a private stored file through a short-lived signed link. */
function useOpenSignedFile(getUrl: (path: string) => Promise<string>) {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  // Open the tab synchronously so pop-up blockers allow it, then point it at the signed link.
  const open = async (path: string) => {
    const tab = window.open('', '_blank');
    setOpeningPath(path);
    try {
      const url = await getUrl(path);
      if (tab) tab.location.href = url;
    } catch (error) {
      tab?.close();
      enqueueSnackbar(getErrorMessage(error) ?? $t({ id: 'error.generic.title' }), { variant: 'error' });
    } finally {
      setOpeningPath(null);
    }
  };

  return { open, openingPath };
}

/** Opens a stored CV through a short-lived signed link. */
export function useOpenCv() {
  const { open, openingPath } = useOpenSignedFile(getCvUrl);
  return { openCv: open, openingPath };
}

/** Opens an offer letter through a short-lived signed link. */
export function useOpenOfferLetter() {
  const { open, openingPath } = useOpenSignedFile(getOfferLetterUrl);
  return { openLetter: open, openingPath };
}
