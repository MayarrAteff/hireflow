import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import { useFormContext, useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { FormTextField } from '@/components/Form/FormTextField';
import { EMPLOYMENT_TYPES, WORK_MODES } from '@/constants/jobs';
import type { JobFormValues } from '@/types/job.types';

export function BasicsStep() {
  const { $t } = useIntl();
  const { control } = useFormContext<JobFormValues>();
  const workMode = useWatch({ control, name: 'workMode' });

  return (
    <Box className="tw-grid tw-gap-5 sm:tw-grid-cols-2">
      <FormTextField name="title" control={control} labelId="jobs.field.title" autoFocus className="sm:tw-col-span-2" />
      <FormTextField select name="employmentType" control={control} labelId="jobs.field.employmentType">
        {EMPLOYMENT_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {$t({ id: `jobs.employmentType.${type}` })}
          </MenuItem>
        ))}
      </FormTextField>
      <FormTextField select name="workMode" control={control} labelId="jobs.field.workMode">
        {WORK_MODES.map((mode) => (
          <MenuItem key={mode} value={mode}>
            {$t({ id: `jobs.workMode.${mode}` })}
          </MenuItem>
        ))}
      </FormTextField>
      <FormTextField
        name="location"
        control={control}
        labelId="jobs.field.location"
        className="sm:tw-col-span-2"
        helperText={workMode === 'remote' ? $t({ id: 'jobs.field.location.remoteHint' }) : undefined}
      />
    </Box>
  );
}
