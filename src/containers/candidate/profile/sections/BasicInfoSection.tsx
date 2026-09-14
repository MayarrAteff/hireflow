import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { useForm } from 'react-hook-form';
import { MdBadge, MdPlace } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { FormTextField } from '@/components/Form/FormTextField';
import { useProfileMutation } from '@/hooks/useProfileMutation';
import { updateProfile } from '@/services/profile.service';
import type { Profile } from '@/types/auth.types';
import { basicInfoSchema, type BasicInfoValues, PROFILE_LIMITS } from '@/validations/profile.validation.schema';

import { AvatarUploader } from '../AvatarUploader';
import { ProfileSectionCard } from '../ProfileSectionCard';

type BasicInfoSectionProps = {
  profile: Profile;
};

export function BasicInfoSection({ profile }: BasicInfoSectionProps) {
  const { $t } = useIntl();
  const { control, handleSubmit, reset, formState } = useForm<BasicInfoValues>({
    resolver: yupResolver(basicInfoSchema),
    defaultValues: { fullName: profile.full_name, headline: profile.headline ?? '', location: profile.location ?? '' },
  });

  const { mutate, isPending, serverErrors } = useProfileMutation({
    mutationKey: ['basics'],
    mutationFn: (userId, values: BasicInfoValues) =>
      updateProfile(userId, {
        full_name: values.fullName,
        headline: values.headline || null,
        location: values.location || null,
      }),
    onSuccess: (_profile, values) => reset(values),
  });

  return (
    <ProfileSectionCard
      section="basics"
      icon={MdBadge}
      color="violet"
      titleId="profile.section.basics.title"
      subtitleId="profile.section.basics.subtitle"
      form={{
        onSubmit: handleSubmit((values) => mutate(values)),
        isDirty: formState.isDirty,
        isPending,
        serverError: serverErrors.general,
      }}
    >
      <Box className="grid items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <AvatarUploader profile={profile} />
        <Box className="grid gap-4">
          <FormTextField
            name="fullName"
            control={control}
            labelId="field.fullName"
            autoComplete="name"
            slotProps={{ htmlInput: { maxLength: PROFILE_LIMITS.fullName } }}
          />
          <FormTextField
            name="headline"
            control={control}
            labelId="profile.field.headline"
            placeholder={$t({ id: 'profile.field.headline.placeholder' })}
            slotProps={{ htmlInput: { maxLength: PROFILE_LIMITS.headline } }}
          />
          <FormTextField
            name="location"
            control={control}
            labelId="profile.field.location"
            autoComplete="address-level2"
            slotProps={{
              htmlInput: { maxLength: PROFILE_LIMITS.location },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MdPlace />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Box>
    </ProfileSectionCard>
  );
}
