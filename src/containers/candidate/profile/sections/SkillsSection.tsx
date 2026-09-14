import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useForm, useWatch } from 'react-hook-form';
import { MdAdd, MdExtension } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { FormChipsField } from '@/components/Form/FormChipsField';
import { FormSectionCard } from '@/components/Form/FormSectionCard';
import { useProfileMutation } from '@/hooks/useProfileMutation';
import { updateProfile } from '@/services/profile.service';
import type { Profile } from '@/types/auth.types';
import { profileSectionId } from '@/utils/profileCompleteness';
import { PROFILE_LIMITS, skillsSchema, type SkillsValues } from '@/validations/profile.validation.schema';

/** Quick picks so candidates don't start from an empty field. */
const SUGGESTED_SKILLS = [
  'Communication',
  'Teamwork',
  'Problem solving',
  'Project management',
  'Microsoft Excel',
  'Data analysis',
  'JavaScript',
  'React',
  'SQL',
  'Figma',
];

type SkillsSectionProps = {
  profile: Profile;
};

export function SkillsSection({ profile }: SkillsSectionProps) {
  const { $t, formatNumber } = useIntl();
  const { control, handleSubmit, reset, setValue, formState } = useForm<SkillsValues>({
    resolver: yupResolver(skillsSchema),
    defaultValues: { skills: profile.skills ?? [] },
  });
  const skills = useWatch({ control, name: 'skills' });
  const suggestions = SUGGESTED_SKILLS.filter(
    (suggestion) => !skills.some((skill) => skill.toLowerCase() === suggestion.toLowerCase()),
  );

  const { mutate, isPending, serverErrors } = useProfileMutation({
    mutationKey: ['skills'],
    mutationFn: (userId, values: SkillsValues) => updateProfile(userId, { skills: values.skills }),
    onSuccess: (_profile, values) => reset(values),
  });

  return (
    <FormSectionCard
      id={profileSectionId('skills')}
      icon={MdExtension}
      color="emerald"
      titleId="profile.section.skills.title"
      subtitleId="profile.section.skills.subtitle"
      form={{
        onSubmit: handleSubmit((values) => mutate(values)),
        isDirty: formState.isDirty,
        isPending,
        serverError: serverErrors.general,
      }}
    >
      <FormChipsField name="skills" control={control} labelId="profile.field.skills" />
      <Typography variant="caption" color="text.secondary" className="mt-1 block text-end">
        {formatNumber(skills.length)} / {formatNumber(PROFILE_LIMITS.skills)}
      </Typography>

      {suggestions.length > 0 && skills.length < PROFILE_LIMITS.skills && (
        <Box className="mt-3">
          <Typography variant="body2" color="text.secondary" className="mb-2">
            {$t({ id: 'profile.skills.suggestions' })}
          </Typography>
          <Box className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <Chip
                key={suggestion}
                size="small"
                variant="outlined"
                icon={<MdAdd />}
                label={suggestion}
                onClick={() => setValue('skills', [...skills, suggestion], { shouldDirty: true })}
              />
            ))}
          </Box>
        </Box>
      )}
    </FormSectionCard>
  );
}
