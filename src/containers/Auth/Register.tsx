import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { FormTextField } from '@/components/Form/FormTextField';
import { AuthLayout } from '@/layout/AuthLayout';
import { register } from '@/services/auth.service';
import type { RegisterPayload } from '@/types/auth.types';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { registerSchema } from '@/validations/auth.validation.schema';

import { RoleSelector } from './RoleSelector';

export function Register() {
  const { $t } = useIntl();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit } = useForm<RegisterPayload>({
    resolver: yupResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', role: 'candidate' },
  });

  const { mutate, isPending, serverErrors } = useFormMutation({
    mutationKey: ['register'],
    mutationFn: register,
    onSuccess: (data) => {
      // With email confirmation on, Supabase returns no session until the link is clicked.
      if (!data.session) {
        enqueueSnackbar($t({ id: 'auth.register.checkEmail' }), { variant: 'info', autoHideDuration: 8000 });
        navigate({ to: '/login' });
      }
    },
  });

  return (
    <AuthLayout>
      <Typography variant="h2" className="mb-1">
        {$t({ id: 'auth.register.title' })}
      </Typography>
      <Typography color="text.secondary" className="mb-8">
        {$t({ id: 'auth.register.subtitle' })}
      </Typography>

      <Box component="form" noValidate onSubmit={handleSubmit((values) => mutate(values))} className="space-y-5">
        {serverErrors.general && <Alert severity="error">{serverErrors.general}</Alert>}
        <Controller
          name="role"
          control={control}
          render={({ field }) => <RoleSelector value={field.value} onChange={field.onChange} />}
        />
        <FormTextField name="fullName" control={control} labelId="field.fullName" autoComplete="name" />
        <FormTextField name="email" control={control} labelId="field.email" type="email" autoComplete="email" />
        <FormTextField
          name="password"
          control={control}
          labelId="field.password"
          type="password"
          autoComplete="new-password"
        />
        <FormTextField
          name="confirmPassword"
          control={control}
          labelId="field.confirmPassword"
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" variant="contained" size="large" fullWidth loading={isPending}>
          {$t({ id: 'auth.register.submit' })}
        </Button>
      </Box>

      <Typography className="mt-6 text-center" color="text.secondary">
        {$t({ id: 'auth.register.haveAccount' })}{' '}
        <Link component={RouterLink} to="/login" fontWeight={600}>
          {$t({ id: 'auth.login.submit' })}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
