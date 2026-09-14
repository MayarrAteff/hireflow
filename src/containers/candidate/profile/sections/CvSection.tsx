import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { type ChangeEvent, type DragEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
  MdCloudUpload,
  MdDeleteOutline,
  MdDescription,
  MdOpenInNew,
  MdPictureAsPdf,
  MdSwapHoriz,
  MdUploadFile,
} from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { CV_FILE_TYPES, MAX_CV_SIZE_BYTES } from '@/constants/app';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useProfileMutation } from '@/hooks/useProfileMutation';
import { getCvFileName, getCvUrl, removeCv, uploadCv } from '@/services/profile.service';
import type { Profile } from '@/types/auth.types';
import { getErrorMessage } from '@/utils/hooks/useFormMutation';

import { ProfileSectionCard } from '../ProfileSectionCard';

const BYTES_IN_MB = 1024 * 1024;

type CvSectionProps = {
  profile: Profile;
};

export function CvSection({ profile }: CvSectionProps) {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const { validateFile } = useFileUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const upload = useProfileMutation({
    mutationKey: ['cv', 'upload'],
    mutationFn: (userId, file: File) => uploadCv(userId, file, profile.cv_path, setProgress),
    successMessageId: 'profile.cv.uploaded',
  });
  const remove = useProfileMutation({
    mutationKey: ['cv', 'remove'],
    mutationFn: (userId, path: string) => removeCv(userId, path),
    successMessageId: 'profile.cv.removed',
    onSuccess: () => setConfirmRemove(false),
  });

  const error = upload.serverErrors.general ?? remove.serverErrors.general;
  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const startUpload = (file: File | undefined) => {
    if (!file || !validateFile(file)) return;
    setProgress(0);
    upload.mutate(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    startUpload(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    startUpload(event.dataTransfer.files[0]);
  };

  const handleDropzoneKey = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  // Open the tab synchronously so pop-up blockers allow it, then point it at the short-lived link.
  const handleView = async () => {
    if (!profile.cv_path) return;
    const tab = window.open('', '_blank');
    setIsOpening(true);
    try {
      const url = await getCvUrl(profile.cv_path);
      if (tab) tab.location.href = url;
    } catch (viewError) {
      tab?.close();
      enqueueSnackbar(getErrorMessage(viewError) ?? $t({ id: 'error.generic.title' }), { variant: 'error' });
    } finally {
      setIsOpening(false);
    }
  };

  const fileName = profile.cv_path ? getCvFileName(profile.cv_path) : '';
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  return (
    <ProfileSectionCard
      section="cv"
      icon={MdUploadFile}
      color="rose"
      titleId="profile.section.cv.title"
      subtitleId="profile.section.cv.subtitle"
    >
      {upload.isPending ? (
        <Box className="tw-rounded-2xl tw-p-5" sx={{ border: 1, borderColor: 'divider' }}>
          <Box className="tw-mb-3 tw-flex tw-items-center tw-justify-between tw-gap-3">
            <Typography fontWeight={600} noWrap>
              {upload.variables?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress variant={progress < 100 ? 'determinate' : 'indeterminate'} value={progress} />
        </Box>
      ) : profile.cv_path ? (
        <Box
          className="tw-flex tw-flex-wrap tw-items-center tw-gap-4 tw-rounded-2xl tw-p-4"
          sx={{ border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}
        >
          <IconTile icon={isPdf ? MdPictureAsPdf : MdDescription} color={isPdf ? 'rose' : 'sky'} size="lg" />
          <Box className="tw-min-w-0 tw-flex-1">
            <Typography fontWeight={600} className="tw-break-all">
              {fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'profile.cv.privacy' })}
            </Typography>
          </Box>
          <Box className="tw-flex tw-flex-wrap tw-gap-1">
            <Button size="small" startIcon={<MdOpenInNew />} onClick={handleView} loading={isOpening}>
              {$t({ id: 'profile.cv.view' })}
            </Button>
            <Button size="small" startIcon={<MdSwapHoriz />} onClick={() => inputRef.current?.click()}>
              {$t({ id: 'profile.cv.replace' })}
            </Button>
            <Button size="small" color="error" startIcon={<MdDeleteOutline />} onClick={() => setConfirmRemove(true)}>
              {$t({ id: 'profile.cv.remove' })}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          role="button"
          tabIndex={0}
          aria-label={$t({ id: 'profile.cv.dropTitle' })}
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleDropzoneKey}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className="tw-flex tw-cursor-pointer tw-flex-col tw-items-center tw-gap-2 tw-rounded-2xl tw-px-6 tw-py-10 tw-text-center tw-transition-colors"
          sx={(theme) => ({
            border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            '&:hover, &:focus-visible': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
            outline: 'none',
          })}
        >
          <IconTile icon={MdCloudUpload} size="lg" />
          <Typography fontWeight={600}>{$t({ id: 'profile.cv.dropTitle' })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {$t(
              { id: 'profile.cv.dropHint' },
              {
                browse: (
                  <Typography key="browse" component="span" variant="body2" color="primary" fontWeight={600}>
                    {$t({ id: 'profile.cv.browse' })}
                  </Typography>
                ),
              },
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {$t({ id: 'profile.cv.formats' }, { size: MAX_CV_SIZE_BYTES / BYTES_IN_MB })}
          </Typography>
        </Box>
      )}

      <input ref={inputRef} type="file" accept={CV_FILE_TYPES.join(',')} hidden onChange={handleFileChange} />

      <Dialog open={confirmRemove} onClose={() => setConfirmRemove(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{$t({ id: 'profile.cv.removeTitle' })}</DialogTitle>
        <DialogContent>
          <DialogContentText>{$t({ id: 'profile.cv.removeBody' })}</DialogContentText>
        </DialogContent>
        <DialogActions className="tw-px-6 tw-pb-4">
          <Button onClick={() => setConfirmRemove(false)}>{$t({ id: 'profile.cancel' })}</Button>
          <Button
            color="error"
            variant="contained"
            loading={remove.isPending}
            onClick={() => profile.cv_path && remove.mutate(profile.cv_path)}
          >
            {$t({ id: 'profile.cv.remove' })}
          </Button>
        </DialogActions>
      </Dialog>
    </ProfileSectionCard>
  );
}
