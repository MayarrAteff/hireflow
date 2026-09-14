import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { MdDeleteOutline, MdDescription, MdOpenInNew, MdPictureAsPdf, MdSwapHoriz, MdUploadFile } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { FileDropzone } from '@/components/Form/FileDropzone';
import { IconTile } from '@/components/UI/IconTile';
import { CV_FILE_TYPES, MAX_CV_SIZE_BYTES } from '@/constants/app';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useOpenCv } from '@/hooks/useOpenCv';
import { useProfileMutation } from '@/hooks/useProfileMutation';
import { getCvFileName, removeCv, uploadCv } from '@/services/profile.service';
import type { Profile } from '@/types/auth.types';

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
  const [progress, setProgress] = useState(0);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { openCv, openingPath } = useOpenCv();

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
            <Button
              size="small"
              startIcon={<MdOpenInNew />}
              onClick={() => profile.cv_path && openCv(profile.cv_path)}
              loading={openingPath === profile.cv_path}
            >
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
        <FileDropzone
          accept={CV_FILE_TYPES}
          onFile={startUpload}
          titleId="profile.cv.dropTitle"
          captionId="profile.cv.formats"
          captionValues={{ size: MAX_CV_SIZE_BYTES / BYTES_IN_MB }}
        />
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
