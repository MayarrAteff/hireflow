import * as yup from 'yup';

export const PROFILE_LIMITS = {
  fullName: 80,
  headline: 120,
  location: 80,
  bio: 1000,
  maxExperience: 60,
  skills: 30,
} as const;

export type BasicInfoValues = { fullName: string; headline: string; location: string };
export type AboutValues = { bio: string; yearsOfExperience: string };
export type ContactValues = { phone: string; linkedinUrl: string; portfolioUrl: string; githubUrl: string };
export type SkillsValues = { skills: string[] };

/** Accept "linkedin.com/in/me" as well as a full URL. */
const optionalUrl = yup
  .string()
  .trim()
  .defined()
  .transform((value: string) => (value && !/^https?:\/\//i.test(value) ? `https://${value}` : value))
  .url('validation.url');

/** Messages are i18n ids; form fields translate them when rendering. */
export const basicInfoSchema: yup.ObjectSchema<BasicInfoValues> = yup.object({
  fullName: yup.string().trim().required('validation.required').max(PROFILE_LIMITS.fullName, 'validation.tooLong'),
  headline: yup.string().trim().defined().max(PROFILE_LIMITS.headline, 'validation.tooLong'),
  location: yup.string().trim().defined().max(PROFILE_LIMITS.location, 'validation.tooLong'),
});

export const aboutSchema: yup.ObjectSchema<AboutValues> = yup.object({
  bio: yup.string().trim().defined().max(PROFILE_LIMITS.bio, 'validation.tooLong'),
  yearsOfExperience: yup
    .string()
    .trim()
    .defined()
    .test('years', 'validation.profile.experience', (value) => {
      if (!value) return true;
      const years = Number(value);
      return Number.isInteger(years) && years >= 0 && years <= PROFILE_LIMITS.maxExperience;
    }),
});

export const contactSchema: yup.ObjectSchema<ContactValues> = yup.object({
  phone: yup
    .string()
    .trim()
    .defined()
    .matches(/^(\+?[\d\s()-]{7,20})?$/, 'validation.phone'),
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  githubUrl: optionalUrl,
});

export const skillsSchema: yup.ObjectSchema<SkillsValues> = yup.object({
  skills: yup.array(yup.string().required()).max(PROFILE_LIMITS.skills, 'validation.profile.skillsMax').defined(),
});
