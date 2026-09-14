import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { CV_FILE_TYPES, MAX_CV_SIZE_BYTES } from '@/constants/app';

const BYTES_IN_MB = 1024 * 1024;

export function useFileUpload({ maxBytes = MAX_CV_SIZE_BYTES, allowedTypes = CV_FILE_TYPES } = {}) {
  const { enqueueSnackbar } = useSnackbar();
  const { $t } = useIntl();

  const validateFile = (file: File) => {
    if (file.size > maxBytes) {
      enqueueSnackbar($t({ id: 'upload.fileSizeExceeded' }, { size: maxBytes / BYTES_IN_MB }), { variant: 'error' });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar($t({ id: 'upload.invalidType' }), { variant: 'error' });
      return false;
    }

    return true;
  };

  return { validateFile };
}
