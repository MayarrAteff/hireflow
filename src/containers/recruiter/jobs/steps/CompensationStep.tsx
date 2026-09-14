import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import { useFormContext } from 'react-hook-form';

import { FormDateField } from '@/components/Form/FormDateField';
import { FormTextField } from '@/components/Form/FormTextField';
import { CURRENCIES } from '@/constants/jobs';
import type { JobFormValues } from '@/types/job.types';

export function CompensationStep() {
  const { control } = useFormContext<JobFormValues>();
  const amountInputProps = { htmlInput: { inputMode: 'decimal' as const, min: 0 } };

  return (
    <Box className="grid gap-5 sm:grid-cols-2">
      <FormTextField
        name="salaryMin"
        control={control}
        labelId="jobs.field.salaryMin"
        type="number"
        slotProps={amountInputProps}
      />
      <FormTextField
        name="salaryMax"
        control={control}
        labelId="jobs.field.salaryMax"
        type="number"
        slotProps={amountInputProps}
      />
      <FormTextField select name="currency" control={control} labelId="jobs.field.currency">
        {CURRENCIES.map((currency) => (
          <MenuItem key={currency} value={currency}>
            {currency}
          </MenuItem>
        ))}
      </FormTextField>
      <FormDateField name="deadline" control={control} labelId="jobs.field.deadline" disablePast />
    </Box>
  );
}
