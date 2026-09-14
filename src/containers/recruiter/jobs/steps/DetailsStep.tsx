import Box from '@mui/material/Box';
import { useFormContext } from 'react-hook-form';

import { FormChipsField } from '@/components/Form/FormChipsField';
import { FormListField } from '@/components/Form/FormListField';
import { FormTextField } from '@/components/Form/FormTextField';
import type { JobFormValues } from '@/types/job.types';

export function DetailsStep() {
  const { control } = useFormContext<JobFormValues>();

  return (
    <Box className="grid gap-6">
      <FormTextField name="description" control={control} labelId="jobs.field.description" multiline minRows={6} />
      <FormListField
        name="requirements"
        control={control}
        labelId="jobs.field.requirements"
        placeholderId="jobs.field.requirements.placeholder"
        hintId="jobs.field.requirements.hint"
        addLabelId="jobs.field.requirements.add"
        removeLabelId="jobs.field.requirements.remove"
      />
      <FormChipsField name="skills" control={control} labelId="jobs.field.skills" />
    </Box>
  );
}
