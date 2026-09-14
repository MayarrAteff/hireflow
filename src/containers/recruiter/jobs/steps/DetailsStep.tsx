import Box from '@mui/material/Box';
import { useFormContext } from 'react-hook-form';

import { FormChipsField } from '@/components/Form/FormChipsField';
import { FormTextField } from '@/components/Form/FormTextField';
import type { JobFormValues } from '@/types/job.types';

export function DetailsStep() {
  const { control } = useFormContext<JobFormValues>();

  return (
    <Box className="tw-grid tw-gap-5">
      <FormTextField name="description" control={control} labelId="jobs.field.description" multiline minRows={6} />
      <FormChipsField name="requirements" control={control} labelId="jobs.field.requirements" />
      <FormChipsField name="skills" control={control} labelId="jobs.field.skills" />
    </Box>
  );
}
