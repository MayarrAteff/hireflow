import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { FormTextField } from '@/components/Form/FormTextField';
import { CompanyIllustration } from '@/components/UI/Illustrations';
import { COMPANY_SIZES } from '@/constants/company';
import { createCompany } from '@/services/company.service';
import type { CreateCompanyPayload } from '@/types/auth.types';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { companySchema } from '@/validations/company.validation.schema';

/** Jobs belong to a company, so a recruiter without one creates it here before posting. */
export function CompanySetupCard() {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const { refreshProfile } = useAuth();

  const { control, handleSubmit } = useForm<CreateCompanyPayload>({
    resolver: yupResolver(companySchema),
    defaultValues: { name: '', website: '', industry: '', size: '' },
  });

  const { mutate, isPending, serverErrors } = useFormMutation({
    mutationKey: ['createCompany'],
    mutationFn: createCompany,
    onSuccess: async () => {
      await refreshProfile();
      enqueueSnackbar($t({ id: 'company.setup.success' }), { variant: 'success' });
    },
  });

  return (
    <Card className="mx-auto max-w-xl overflow-hidden">
      <Box
        className="flex justify-center pt-6"
        sx={(theme) => ({
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, transparent 100%)`,
        })}
      >
        <CompanyIllustration className="w-48" />
      </Box>
      <CardContent className="p-6 sm:p-8">
        <Typography variant="h3" className="mb-1 text-center">
          {$t({ id: 'company.setup.title' })}
        </Typography>
        <Typography color="text.secondary" className="mb-6 text-center">
          {$t({ id: 'company.setup.body' })}
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit((values) => mutate(values))} className="space-y-5">
          {serverErrors.general && <Alert severity="error">{serverErrors.general}</Alert>}
          <FormTextField name="name" control={control} labelId="company.field.name" autoComplete="organization" />
          <FormTextField name="website" control={control} labelId="company.field.website" type="url" />
          <Box className="grid gap-5 sm:grid-cols-2">
            <FormTextField
              name="industry"
              control={control}
              labelId="company.field.industry"
              placeholder={$t({ id: 'company.field.industry.placeholder' })}
            />
            <FormTextField select name="size" control={control} labelId="company.field.size">
              <MenuItem value="">
                <em>{$t({ id: 'company.field.size.none' })}</em>
              </MenuItem>
              {COMPANY_SIZES.map((size) => (
                <MenuItem key={size} value={size}>
                  {$t({ id: 'jobs.details.companySize' }, { size })}
                </MenuItem>
              ))}
            </FormTextField>
          </Box>
          <Typography variant="body2" color="text.secondary" className="text-center">
            {$t({ id: 'company.setup.laterHint' })}
          </Typography>
          <Button type="submit" variant="contained" size="large" fullWidth loading={isPending}>
            {$t({ id: 'company.setup.submit' })}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
