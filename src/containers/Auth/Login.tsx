import { yupResolver } from '@hookform/resolvers/yup';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { FormTextField } from '@/components/Form/FormTextField';
import { AuthLayout } from '@/layout/AuthLayout';
import { login } from '@/services/auth.service';
import type { LoginPayload } from '@/types/auth.types';
import { useFormMutation } from '@/utils/hooks/useFormMutation';
import { loginSchema } from '@/validations/auth.validation.schema';

/** After sign-in the auth context updates and the `_visitor` guard redirects to the portal. */
export function Login() {
  const { $t } = useIntl();
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit } = useForm<LoginPayload>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate, isPending, serverErrors } = useFormMutation({
    mutationKey: ['login'],
    mutationFn: login,
    onSuccess: () => enqueueSnackbar($t({ id: 'auth.login.success' }), { variant: 'success' }),
  });

  return (
    <AuthLayout>
      <Typography variant="h2" className="mb-1">
        {$t({ id: 'auth.login.title' })}
      </Typography>
      <Typography color="text.secondary" className="mb-8">
        {$t({ id: 'auth.login.subtitle' })}
      </Typography>

      <Box component="form" noValidate onSubmit={handleSubmit((values) => mutate(values))} className="space-y-5">
        {serverErrors.general && <Alert severity="error">{serverErrors.general}</Alert>}
        <FormTextField name="email" control={control} labelId="field.email" type="email" autoComplete="email" />
        <FormTextField
          name="password"
          control={control}
          labelId="field.password"
          type="password"
          autoComplete="current-password"
        />
        <Button type="submit" variant="contained" size="large" fullWidth loading={isPending}>
          {$t({ id: 'auth.login.submit' })}
        </Button>
      </Box>

      <Typography className="mt-6 text-center" color="text.secondary">
        {$t({ id: 'auth.login.noAccount' })}{' '}
        <Link component={RouterLink} to="/register" fontWeight={600}>
          {$t({ id: 'auth.register.submit' })}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
