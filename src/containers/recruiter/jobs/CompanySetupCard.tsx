import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { FormTextField } from '@/components/Form/FormTextField';
import { CompanyIllustration } from '@/components/UI/Illustrations';
import { createCompany } from '@/services/company.service';
import type { CreateCompanyPayload } from '@/types/auth.types';
import { useAuth } from '@/utils/hooks/useAuth';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { companySchema } from '@/validations/job.validation.schema';

/** Jobs belong to a company, so a recruiter without one creates it here before posting. */
export function CompanySetupCard() {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const { refreshProfile } = useAuth();

  const { control, handleSubmit } = useForm<CreateCompanyPayload>({
    resolver: yupResolver(companySchema),
    defaultValues: { name: '', website: '', industry: '' },
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
    <Card className="tw-mx-auto tw-max-w-xl tw-overflow-hidden">
      <Box
        className="tw-flex tw-justify-center tw-pt-6"
        sx={(theme) => ({
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, transparent 100%)`,
        })}
      >
        <CompanyIllustration className="tw-w-48" />
      </Box>
      <CardContent className="tw-p-6 sm:tw-p-8">
        <Typography variant="h3" className="tw-mb-1 tw-text-center">
          {$t({ id: 'company.setup.title' })}
        </Typography>
        <Typography color="text.secondary" className="tw-mb-6 tw-text-center">
          {$t({ id: 'company.setup.body' })}
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit((values) => mutate(values))} className="tw-space-y-5">
          {serverErrors.general && <Alert severity="error">{serverErrors.general}</Alert>}
          <FormTextField name="name" control={control} labelId="company.field.name" autoComplete="organization" />
          <FormTextField name="website" control={control} labelId="company.field.website" type="url" />
          <FormTextField name="industry" control={control} labelId="company.field.industry" />
          <Button type="submit" variant="contained" size="large" fullWidth loading={isPending}>
            {$t({ id: 'company.setup.submit' })}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
