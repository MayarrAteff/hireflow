import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { useForm, useWatch } from 'react-hook-form';
import { MdAutoStories } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { FormSectionCard } from '@/components/Form/FormSectionCard';
import { FormTextField } from '@/components/Form/FormTextField';
import { useProfileMutation } from '@/hooks/useProfileMutation';
import { updateProfile } from '@/services/profile.service';
import type { Profile } from '@/types/auth.types';
import { profileSectionId } from '@/utils/profileCompleteness';
import { aboutSchema, type AboutValues, PROFILE_LIMITS } from '@/validations/profile.validation.schema';

type AboutSectionProps = {
  profile: Profile;
};

export function AboutSection({ profile }: AboutSectionProps) {
  const { $t, formatNumber } = useIntl();
  const { control, handleSubmit, reset, formState } = useForm<AboutValues>({
    resolver: yupResolver(aboutSchema),
    defaultValues: {
      bio: profile.bio ?? '',
      yearsOfExperience: profile.years_of_experience?.toString() ?? '',
    },
  });
  const bio = useWatch({ control, name: 'bio' });

  const { mutate, isPending, serverErrors } = useProfileMutation({
    mutationKey: ['about'],
    mutationFn: (userId, values: AboutValues) =>
      updateProfile(userId, {
        bio: values.bio || null,
        years_of_experience: values.yearsOfExperience ? Number(values.yearsOfExperience) : null,
      }),
    onSuccess: (_profile, values) => reset(values),
  });

  return (
    <FormSectionCard
      id={profileSectionId('about')}
      icon={MdAutoStories}
      color="amber"
      titleId="profile.section.about.title"
      subtitleId="profile.section.about.subtitle"
      form={{
        onSubmit: handleSubmit((values) => mutate(values)),
        isDirty: formState.isDirty,
        isPending,
        serverError: serverErrors.general,
      }}
    >
      <Box className="grid gap-4">
        <FormTextField
          name="bio"
          control={control}
          labelId="profile.field.bio"
          placeholder={$t({ id: 'profile.field.bio.placeholder' })}
          multiline
          minRows={5}
          helperText={`${formatNumber(bio.length)} / ${formatNumber(PROFILE_LIMITS.bio)}`}
          slotProps={{ htmlInput: { maxLength: PROFILE_LIMITS.bio } }}
        />
        <FormTextField
          name="yearsOfExperience"
          control={control}
          labelId="profile.field.experience"
          type="number"
          className="sm:max-w-xs"
          slotProps={{
            htmlInput: { min: 0, max: PROFILE_LIMITS.maxExperience, inputMode: 'numeric' },
            input: {
              endAdornment: (
                <InputAdornment position="end">{$t({ id: 'profile.field.experience.unit' })}</InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </FormSectionCard>
  );
}
