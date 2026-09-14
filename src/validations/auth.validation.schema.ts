import * as yup from 'yup';

import { PASSWORD_MIN_LENGTH } from '@/constants/app';
import type { LoginPayload, RegisterPayload } from '@/types/auth.types';

/** Messages are i18n ids; form fields translate them when rendering. */
export const loginSchema: yup.ObjectSchema<LoginPayload> = yup.object({
  email: yup.string().trim().required('validation.required').email('validation.email'),
  password: yup.string().required('validation.required'),
});

export const registerSchema: yup.ObjectSchema<RegisterPayload> = yup.object({
  fullName: yup.string().trim().required('validation.required'),
  email: yup.string().trim().required('validation.required').email('validation.email'),
  password: yup
    .string()
    .required('validation.required')
    .min(PASSWORD_MIN_LENGTH, 'validation.password.min')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'validation.password.strength'),
  confirmPassword: yup
    .string()
    .required('validation.required')
    .oneOf([yup.ref('password')], 'validation.password.match'),
  role: yup.mixed<RegisterPayload['role']>().oneOf(['recruiter', 'candidate']).required('validation.required'),
});
