import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { MdPhotoCamera } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { AVATAR_FILE_TYPES, MAX_AVATAR_SOURCE_BYTES } from '@/constants/app';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useProfileMutation } from '@/hooks/useProfileMutation';
import { removeAvatar, uploadAvatar } from '@/services/profile.service';
import { brandGradient } from '@/styles/themes/accents';
import type { Profile } from '@/types/auth.types';

import { AvatarCropDialog } from './AvatarCropDialog';

type AvatarUploaderProps = {
  profile: Profile;
};

export function AvatarUploader({ profile }: AvatarUploaderProps) {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const { validateFile } = useFileUpload({ maxBytes: MAX_AVATAR_SOURCE_BYTES, allowedTypes: AVATAR_FILE_TYPES });

  const upload = useProfileMutation({
    mutationKey: ['avatar', 'upload'],
    mutationFn: (userId, image: Blob) => uploadAvatar(userId, image),
    successMessageId: 'profile.photo.saved',
  });
  const remove = useProfileMutation({
    mutationKey: ['avatar', 'remove'],
    mutationFn: (userId) => removeAvatar(userId),
    successMessageId: 'profile.photo.removed',
  });

  // Upload sections have no form to show errors in, so surface them as a toast.
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
  const initials = (profile.full_name || profile.email).slice(0, 1).toUpperCase();

  return (
    <Box className="tw-flex tw-flex-col tw-items-center tw-gap-2">
      <Box className="tw-relative">
        <Box className="tw-rounded-full tw-p-1" sx={(theme) => ({ background: brandGradient(theme) })}>
          <Avatar
            src={profile.avatar_url ?? undefined}
            alt={profile.full_name}
            sx={{
              width: 112,
              height: 112,
              fontSize: 40,
              fontWeight: 700,
              border: 4,
              borderColor: 'background.paper',
              bgcolor: 'primary.light',
              color: 'primary.main',
            }}
          >
            {initials}
          </Avatar>
        </Box>
        {isBusy && (
          <Box className="tw-absolute tw-inset-1 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-black/40">
            <CircularProgress size={32} sx={{ color: '#fff' }} />
          </Box>
        )}
        <Tooltip title={$t({ id: profile.avatar_url ? 'profile.photo.change' : 'profile.photo.upload' })}>
          <IconButton
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
            aria-label={$t({ id: profile.avatar_url ? 'profile.photo.change' : 'profile.photo.upload' })}
            className="tw-absolute tw-bottom-1 tw-end-1"
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

      {profile.avatar_url && (
        <Button size="small" color="error" disabled={isBusy} onClick={() => remove.mutate(undefined)}>
          {$t({ id: 'profile.photo.remove' })}
        </Button>
      )}

      <input ref={inputRef} type="file" accept={AVATAR_FILE_TYPES.join(',')} hidden onChange={handleFileChange} />
      <AvatarCropDialog
        file={cropFile}
        onClose={() => setCropFile(null)}
        onConfirm={(image) => {
          setCropFile(null);
          upload.mutate(image);
        }}
      />
    </Box>
  );
}
