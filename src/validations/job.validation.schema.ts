import type { Dayjs } from 'dayjs';
import * as yup from 'yup';

import { EMPLOYMENT_TYPES, WORK_MODES } from '@/constants/jobs';
import type { CreateCompanyPayload } from '@/types/auth.types';
import type { EmploymentType, JobFormValues, WorkMode } from '@/types/job.types';
import { dayjs } from '@/utils/dayjs';

export const JOB_DESCRIPTION_MIN_LENGTH = 50;

const optionalAmount = yup
  .string()
  .trim()
  .defined()
  .test('number', 'validation.number', (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0));

/** Messages are i18n ids; form fields translate them when rendering. */
export const jobSchema: yup.ObjectSchema<JobFormValues> = yup.object({
  title: yup.string().trim().required('validation.required'),
  employmentType: yup.mixed<EmploymentType>().oneOf(EMPLOYMENT_TYPES).required('validation.required'),
  workMode: yup.mixed<WorkMode>().oneOf(WORK_MODES).required('validation.required'),
  location: yup
    .string()
    .trim()
    .defined()
    .test('required-unless-remote', 'validation.required', function (value) {
      return this.parent.workMode === 'remote' || Boolean(value);
    }),
  description: yup
    .string()
    .trim()
    .required('validation.required')
    .min(JOB_DESCRIPTION_MIN_LENGTH, 'validation.job.descriptionMin'),
  requirements: yup.array(yup.string().required()).defined(),
  skills: yup.array(yup.string().required()).min(1, 'validation.job.skillsMin').defined(),
  salaryMin: optionalAmount,
  salaryMax: optionalAmount.test('gte-min', 'validation.job.salaryRange', function (value) {
    const min = this.parent.salaryMin;
    return !value || !min || Number(value) >= Number(min);
  }),
  currency: yup.string().required('validation.required'),
  deadline: yup
    .mixed<Dayjs>()
    .nullable()
    .defined()
    .test('valid', 'validation.date', (value) => !value || value.isValid())
    .test('not-past', 'validation.job.deadlinePast', (value) => !value || !value.isBefore(dayjs(), 'day')),
});

export const companySchema: yup.ObjectSchema<CreateCompanyPayload> = yup.object({
  name: yup.string().trim().required('validation.required'),
  website: yup.string().trim().defined().url('validation.url'),
  industry: yup.string().trim().defined(),
});
