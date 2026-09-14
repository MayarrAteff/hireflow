import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { MdPhotoCamera } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ImageCropDialog } from '@/components/Form/ImageCropDialog';
import { CompanyLogo } from '@/components/Jobs/CompanyLogo';
import { LOGO_FILE_TYPES, MAX_LOGO_SOURCE_BYTES } from '@/constants/company';
import { useCompanyMutation } from '@/hooks/useCompanyMutation';
import { useFileUpload } from '@/hooks/useFileUpload';
import { removeCompanyLogo, uploadCompanyLogo } from '@/services/company.service';
import type { Company } from '@/types/auth.types';

type CompanyLogoUploaderProps = {
  company: Company;
};

export function CompanyLogoUploader({ company }: CompanyLogoUploaderProps) {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const { validateFile } = useFileUpload({ maxBytes: MAX_LOGO_SOURCE_BYTES, allowedTypes: LOGO_FILE_TYPES });

  const upload = useCompanyMutation({
    mutationKey: ['logo', 'upload'],
    mutationFn: (companyId, image: Blob) => uploadCompanyLogo(companyId, image),
    successMessageId: 'company.logo.saved',
  });
  const remove = useCompanyMutation({
    mutationKey: ['logo', 'remove'],
    mutationFn: (companyId) => removeCompanyLogo(companyId),
    successMessageId: 'company.logo.removed',
  });

  // Upload controls have no form to show errors in, so surface them as a toast.
  const error = upload.serverErrors.general ?? remove.serverErrors.general;
  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file && validateFile(file)) setCropFile(file);
  };

  const isBusy = upload.isPending || remove.isPending;
  const actionLabel = $t({ id: company.logo_url ? 'company.logo.change' : 'company.logo.upload' });

  return (
    <Box className="flex flex-col items-center gap-2">
      <Box className="relative">
        <CompanyLogo
          name={company.name}
          logoUrl={company.logo_url}
          size={112}
          sx={{ border: 1, borderColor: 'divider', boxShadow: 2 }}
        />
        {isBusy && (
          <Box className="absolute inset-0 flex items-center justify-center rounded-[29px] bg-black/40">
            <CircularProgress size={32} sx={{ color: '#fff' }} />
          </Box>
        )}
        <Tooltip title={actionLabel}>
          <IconButton
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
            aria-label={actionLabel}
            className="absolute -bottom-2 -end-2"
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              border: 3,
              borderColor: 'background.paper',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
            size="small"
          >
            <MdPhotoCamera size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      {company.logo_url ? (
        <Button size="small" color="error" disabled={isBusy} onClick={() => remove.mutate(undefined)}>
          {$t({ id: 'company.logo.remove' })}
        </Button>
      ) : (
        <Box className="h-2" />
      )}

      <input ref={inputRef} type="file" accept={LOGO_FILE_TYPES.join(',')} hidden onChange={handleFileChange} />
      <ImageCropDialog
        file={cropFile}
        shape="rounded"
        titleId="company.logo.cropTitle"
        confirmId="company.logo.save"
        onClose={() => setCropFile(null)}
        onConfirm={(image) => {
          setCropFile(null);
          upload.mutate(image);
        }}
      />
    </Box>
  );
}
