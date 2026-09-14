import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MdCheck, MdClose, MdDescription, MdPictureAsPdf, MdSend } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { FileDropzone } from '@/components/Form/FileDropzone';
import { IconTile } from '@/components/UI/IconTile';
import { CV_FILE_TYPES, MAX_CV_SIZE_BYTES } from '@/constants/app';
import { applicationsQueryKey } from '@/hooks/useApplications';
import { useFileUpload } from '@/hooks/useFileUpload';
import { applyToJob } from '@/services/applications.service';
import { getCvFileName } from '@/services/profile.service';
import { ACCENT_COLORS, brandGradient } from '@/styles/themes/accents';
import type { ApplicationCv } from '@/types/application.types';
import type { JobWithCompany } from '@/types/job.types';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { getProfileCompleteness } from '@/utils/profileCompleteness';

const COVER_LETTER_MAX = 2000;
/** Below this, applying still works but we suggest finishing the profile first. */
const PROFILE_NUDGE_PERCENT = 50;
const BYTES_IN_MB = 1024 * 1024;

type CvChoice = 'profile' | 'upload';

type CvOptionProps = {
  selected: boolean;
  onSelect: () => void;
  fileName: string;
  captionId: string;
  onClear?: () => void;
};

function CvOption({ selected, onSelect, fileName, captionId, onClear }: CvOptionProps) {
  const { $t } = useIntl();
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  return (
    <Box
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onSelect()}
      className="tw-flex tw-cursor-pointer tw-items-center tw-gap-3 tw-rounded-2xl tw-p-3"
      sx={(theme) => ({
        border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
        outline: 'none',
        '&:focus-visible': { borderColor: 'primary.main' },
      })}
    >
      <IconTile icon={isPdf ? MdPictureAsPdf : MdDescription} color={isPdf ? 'rose' : 'sky'} />
      <Box className="tw-min-w-0 tw-flex-1">
        <Typography fontWeight={600} noWrap>
          {fileName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {$t({ id: captionId })}
        </Typography>
      </Box>
      {onClear && (
        <IconButton
          size="small"
          aria-label={$t({ id: 'apply.cv.clear' })}
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
        >
          <MdClose />
        </IconButton>
      )}
      <Box
        className="tw-flex tw-h-5 tw-w-5 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full"
        sx={selected ? { bgcolor: 'primary.main', color: '#fff' } : { border: 2, borderColor: 'divider' }}
      >
        {selected && <MdCheck size={14} />}
      </Box>
    </Box>
  );
}

type ApplyDialogProps = {
  job: JobWithCompany;
  open: boolean;
  onClose: () => void;
};

export function ApplyDialog({ job, open, onClose }: ApplyDialogProps) {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { validateFile } = useFileUpload();

  const profileCvPath = profile?.cv_path ?? null;
  const [cvChoice, setCvChoice] = useState<CvChoice>(profileCvPath ? 'profile' : 'upload');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [progress, setProgress] = useState(0);
  const [showCvError, setShowCvError] = useState(false);

  const { percent } = getProfileCompleteness(profile);
  const company = job.company?.name ?? '';

  const { mutate, isPending, isSuccess, serverErrors, reset } = useFormMutation({
    mutationKey: ['apply', job.id],
    mutationFn: (cv: ApplicationCv) =>
      applyToJob({ candidateId: profile?.id as string, jobId: job.id, cv, coverLetter, onUploadProgress: setProgress }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: applicationsQueryKey }),
  });

  const handleSubmit = () => {
    if (cvChoice === 'profile' && profileCvPath) {
      mutate({ source: 'profile', path: profileCvPath });
    } else if (uploadFile) {
      setProgress(0);
      mutate({ source: 'upload', file: uploadFile });
    } else {
      setShowCvError(true);
    }
  };

  const handleClose = () => {
    if (isPending) return;
    onClose();
    // Reset once the close animation is done, so a success screen doesn't flash back to the form.
    setTimeout(() => {
      reset();
      setCoverLetter('');
      setUploadFile(null);
      setShowCvError(false);
    }, 300);
  };

  const handlePickedFile = (file: File) => {
    if (!validateFile(file)) return;
    setUploadFile(file);
    setCvChoice('upload');
    setShowCvError(false);
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogContent className="tw-flex tw-flex-col tw-items-center tw-px-6 tw-py-10 tw-text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="tw-mb-5 tw-flex tw-h-20 tw-w-20 tw-items-center tw-justify-center tw-rounded-full tw-text-white"
            style={{ backgroundColor: ACCENT_COLORS.emerald, boxShadow: `0 16px 32px -12px ${ACCENT_COLORS.emerald}` }}
          >
            <MdCheck size={44} />
          </motion.div>
          <Typography variant="h3" className="tw-mb-2">
            {$t({ id: 'apply.success.title' })}
          </Typography>
          <Typography color="text.secondary" className="tw-mb-6">
            {$t({ id: 'apply.success.body' }, { company: company || job.title })}
          </Typography>
          <Box className="tw-flex tw-flex-wrap tw-justify-center tw-gap-2">
            <Button variant="outlined" onClick={handleClose}>
              {$t({ id: 'apply.success.backToJob' })}
            </Button>
            <Button variant="contained" component={RouterLink} to="/candidate/dashboard">
              {$t({ id: 'apply.success.dashboard' })}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth scroll="body">
      <Box className="tw-h-1.5" sx={(theme) => ({ background: brandGradient(theme, 90) })} />
      <DialogTitle className="tw-flex tw-items-start tw-gap-3 tw-pe-14">
        <Box className="tw-min-w-0">
          <Typography variant="h4" component="span" className="tw-block">
            {$t({ id: 'apply.title' })}
          </Typography>
          <Typography color="text.secondary" component="span" className="tw-block">
            {job.title}
            {company && ` · ${company}`}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          aria-label={$t({ id: 'profile.cancel' })}
          className="tw-absolute tw-end-3 tw-top-3"
          disabled={isPending}
        >
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent className="tw-flex tw-flex-col tw-gap-5">
        {serverErrors.general && <Alert severity="error">{serverErrors.general}</Alert>}

        <Box className="tw-flex tw-items-center tw-gap-3 tw-rounded-2xl tw-p-3" sx={{ bgcolor: 'action.hover' }}>
          <Avatar
            src={profile?.avatar_url ?? undefined}
            sx={{ width: 48, height: 48, bgcolor: 'primary.light', color: 'primary.main' }}
          >
            {(profile?.full_name || profile?.email || '?').slice(0, 1).toUpperCase()}
          </Avatar>
          <Box className="tw-min-w-0 tw-flex-1">
            <Typography fontWeight={700} noWrap>
              {profile?.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {profile?.headline || profile?.email}
            </Typography>
          </Box>
          <Link component={RouterLink} to="/candidate/profile" variant="body2" fontWeight={600} className="tw-shrink-0">
            {$t({ id: 'apply.profile.edit' })}
          </Link>
        </Box>

        {percent < PROFILE_NUDGE_PERCENT && (
          <Alert severity="info" icon={false}>
            {$t({ id: 'apply.profile.nudge' }, { percent })}
          </Alert>
        )}

        <Box>
          <Typography fontWeight={600} className="tw-mb-2">
            {$t({ id: 'apply.cv.title' })}
          </Typography>
          <Box role="radiogroup" aria-label={$t({ id: 'apply.cv.title' })} className="tw-flex tw-flex-col tw-gap-2">
            {profileCvPath && (
              <CvOption
                selected={cvChoice === 'profile'}
                onSelect={() => setCvChoice('profile')}
                fileName={getCvFileName(profileCvPath)}
                captionId="apply.cv.fromProfile"
              />
            )}
            {uploadFile ? (
              <CvOption
                selected={cvChoice === 'upload'}
                onSelect={() => setCvChoice('upload')}
                fileName={uploadFile.name}
                captionId="apply.cv.forThisJob"
                onClear={() => {
                  setUploadFile(null);
                  if (profileCvPath) setCvChoice('profile');
                }}
              />
            ) : (
              <FileDropzone
                compact
                accept={CV_FILE_TYPES}
                onFile={handlePickedFile}
                titleId={profileCvPath ? 'apply.cv.uploadDifferent' : 'apply.cv.upload'}
                captionId="profile.cv.formats"
                captionValues={{ size: MAX_CV_SIZE_BYTES / BYTES_IN_MB }}
                error={showCvError}
              />
            )}
          </Box>
          {showCvError && <FormHelperText error>{$t({ id: 'apply.cv.required' })}</FormHelperText>}
          {!profileCvPath && (
            <FormHelperText>
              {$t(
                { id: 'apply.cv.saveTip' },
                {
                  link: (
                    <Link key="profile" component={RouterLink} to="/candidate/profile">
                      {$t({ id: 'menu.profile' })}
                    </Link>
                  ),
                },
              )}
            </FormHelperText>
          )}
        </Box>

        <TextField
          label={$t({ id: 'apply.coverLetter' })}
          placeholder={$t({ id: 'apply.coverLetter.placeholder' }, { company: company || job.title })}
          value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)}
          multiline
          minRows={4}
          fullWidth
          helperText={`${coverLetter.length} / ${COVER_LETTER_MAX}`}
          slotProps={{ htmlInput: { maxLength: COVER_LETTER_MAX } }}
        />

        {isPending && cvChoice === 'upload' && (
          <Box>
            <Typography variant="body2" color="text.secondary" className="tw-mb-1">
              {$t({ id: 'apply.uploading' }, { percent: progress })}
            </Typography>
            <LinearProgress variant={progress < 100 ? 'determinate' : 'indeterminate'} value={progress} />
          </Box>
        )}
      </DialogContent>

      <DialogActions className="tw-px-6 tw-pb-5">
        <Button onClick={handleClose} disabled={isPending}>
          {$t({ id: 'profile.cancel' })}
        </Button>
        <Button
          variant="contained"
          size="large"
          endIcon={<MdSend className="rtl:tw-rotate-180" />}
          onClick={handleSubmit}
          loading={isPending}
        >
          {$t({ id: 'apply.submit' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
