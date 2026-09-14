import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useWatch } from 'react-hook-form';
import { MdVisibility } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { brandGradient } from '@/styles/themes/accents';
import type { JobFormValues } from '@/types/job.types';
import { useAuth } from '@/utils/hooks/useAuth';

const PREVIEW_SKILLS_LIMIT = 6;

/** Updates as the recruiter types, so they can see the job take shape. */
export function JobPreviewCard() {
  const { $t, formatNumber } = useIntl();
  const { profile } = useAuth();
  const values = useWatch<JobFormValues>();

  const salary = [values.salaryMin, values.salaryMax].filter(Boolean).map((amount) => formatNumber(Number(amount)));

  return (
    <Card className="overflow-hidden">
      <Box className="relative h-14" sx={(theme) => ({ background: brandGradient(theme) })}>
        <Chip
          size="small"
          icon={<MdVisibility />}
          label={$t({ id: 'jobs.preview.title' })}
          className="absolute end-3 top-3"
          sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
        />
      </Box>
      <CardContent className="-pt-6 flex flex-col gap-3">
        <Box
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold"
          sx={{
            bgcolor: 'background.paper',
            color: 'primary.main',
            border: 3,
            borderColor: 'background.paper',
            boxShadow: 2,
          }}
        >
          {(profile?.company?.name || '?').slice(0, 1).toUpperCase()}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {profile?.company?.name || $t({ id: 'jobs.preview.companyPlaceholder' })}
          </Typography>
          <Typography variant="h5" className="break-words" color={values.title ? 'text.primary' : 'text.disabled'}>
            {values.title || $t({ id: 'jobs.preview.titlePlaceholder' })}
          </Typography>
        </Box>

        <Box className="flex flex-wrap gap-1.5">
          {values.employmentType && (
            <Chip size="small" color="primary" label={$t({ id: `jobs.employmentType.${values.employmentType}` })} />
          )}
          {values.workMode && (
            <Chip size="small" color="secondary" label={$t({ id: `jobs.workMode.${values.workMode}` })} />
          )}
          {values.location && <Chip size="small" variant="outlined" label={values.location} />}
        </Box>

        {salary.length > 0 && (
          <Typography fontWeight={600} color="primary">
            {salary.join(' – ')} {values.currency}
          </Typography>
        )}

        {!!values.skills?.length && (
          <Box className="flex flex-wrap gap-1.5">
            {values.skills.slice(0, PREVIEW_SKILLS_LIMIT).map((skill) => (
              <Chip key={skill} size="small" variant="outlined" label={skill} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
