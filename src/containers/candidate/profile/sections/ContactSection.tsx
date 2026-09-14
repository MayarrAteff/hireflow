import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdAlternateEmail, MdContactPhone, MdLanguage, MdPhone } from 'react-icons/md';

import { FormTextField } from '@/components/Form/FormTextField';
import { ReadOnlyField } from '@/components/Form/ReadOnlyField';
import { useProfileMutation } from '@/hooks/useProfileMutation';
import { updateProfile } from '@/services/profile.service';
import type { Profile } from '@/types/auth.types';
import { contactSchema, type ContactValues } from '@/validations/profile.validation.schema';

import { ProfileSectionCard } from '../ProfileSectionCard';

const adornment = (icon: ReactNode) => ({
  input: { startAdornment: <InputAdornment position="start">{icon}</InputAdornment> },
});

type ContactSectionProps = {
  profile: Profile;
};

export function ContactSection({ profile }: ContactSectionProps) {
  const { control, handleSubmit, reset, formState } = useForm<ContactValues>({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      phone: profile.phone ?? '',
      linkedinUrl: profile.linkedin_url ?? '',
      portfolioUrl: profile.portfolio_url ?? '',
      githubUrl: profile.github_url ?? '',
    },
  });

  const { mutate, isPending, serverErrors } = useProfileMutation({
    mutationKey: ['contact'],
    mutationFn: (userId, values: ContactValues) =>
      updateProfile(userId, {
        phone: values.phone || null,
        linkedin_url: values.linkedinUrl || null,
        portfolio_url: values.portfolioUrl || null,
        github_url: values.githubUrl || null,
      }),
    // The schema adds https:// to bare links, so reset to the saved values to show what was stored.
    onSuccess: (_profile, values) => reset(values),
  });

  return (
    <ProfileSectionCard
      section="contact"
      icon={MdContactPhone}
      color="sky"
      titleId="profile.section.contact.title"
      subtitleId="profile.section.contact.subtitle"
      form={{
        onSubmit: handleSubmit((values) => mutate(values)),
        isDirty: formState.isDirty,
        isPending,
        serverError: serverErrors.general,
      }}
    >
      <Box className="grid gap-4 sm:grid-cols-2">
        <ReadOnlyField
          labelId="field.email"
          value={profile.email}
          icon={MdAlternateEmail}
          badgeId="profile.field.email.badge"
          hintId="profile.field.email.hint"
        />
        <FormTextField
          name="phone"
          control={control}
          labelId="profile.field.phone"
          type="tel"
          autoComplete="tel"
          placeholder="+966 5X XXX XXXX"
          slotProps={adornment(<MdPhone />)}
        />
        <FormTextField
          name="linkedinUrl"
          control={control}
          labelId="profile.field.linkedin"
          placeholder="linkedin.com/in/your-name"
          slotProps={adornment(<FaLinkedin color="#0A66C2" />)}
        />
        <FormTextField
          name="githubUrl"
          control={control}
          labelId="profile.field.github"
          placeholder="github.com/your-name"
          slotProps={adornment(<FaGithub />)}
        />
        <FormTextField
          name="portfolioUrl"
          control={control}
          labelId="profile.field.portfolio"
          placeholder="yourwebsite.com"
          className="sm:col-span-2"
          slotProps={adornment(<MdLanguage />)}
        />
      </Box>
    </ProfileSectionCard>
  );
}
