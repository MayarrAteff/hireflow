import * as yup from 'yup';

import { COMPANY_LIMITS, COMPANY_SIZES } from '@/constants/company';
import type { CompanyDetailsValues, CreateCompanyPayload } from '@/types/auth.types';

import { optionalUrl } from './profile.validation.schema';

const companyFields = {
  name: yup.string().trim().required('validation.required').max(COMPANY_LIMITS.name, 'validation.tooLong'),
  website: optionalUrl,
  industry: yup.string().trim().defined().max(COMPANY_LIMITS.industry, 'validation.tooLong'),
  size: yup
    .string()
    .defined()
    .oneOf(['', ...COMPANY_SIZES], 'validation.required'),
};

/** Messages are i18n ids; form fields translate them when rendering. */
export const companySchema: yup.ObjectSchema<CreateCompanyPayload> = yup.object(companyFields);

export const companyDetailsSchema: yup.ObjectSchema<CompanyDetailsValues> = yup.object({
  ...companyFields,
  about: yup.string().trim().defined().max(COMPANY_LIMITS.about, 'validation.tooLong'),
});
