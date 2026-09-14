import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import { useForm, useWatch } from 'react-hook-form';
import { MdAutoStories, MdLanguage } from 'react-icons/md';
import { useIntl } from 'react-intl';
import * as yup from 'yup';

import { FormSectionCard } from '@/components/Form/FormSectionCard';
import { FormTextField } from '@/components/Form/FormTextField';
import { COMPANY_LIMITS } from '@/constants/company';
import { useCompanyMutation } from '@/hooks/useCompanyMutation';
import { updateCompany } from '@/services/company.service';
import type { Company, CompanyDetailsValues } from '@/types/auth.types';
import { companySectionId } from '@/utils/companyCompleteness';
import { companyDetailsSchema } from '@/validations/company.validation.schema';

type AboutValues = Pick<CompanyDetailsValues, 'website' | 'about'>;

const aboutSchema: yup.ObjectSchema<AboutValues> = companyDetailsSchema.pick(['website', 'about']);

type CompanyAboutSectionProps = {
  company: Company;
};

export function CompanyAboutSection({ company }: CompanyAboutSectionProps) {
  const { $t, formatNumber } = useIntl();
  const { control, handleSubmit, reset, formState } = useForm<AboutValues>({
    resolver: yupResolver(aboutSchema),
    defaultValues: { website: company.website ?? '', about: company.about ?? '' },
  });
  const about = useWatch({ control, name: 'about' });

  const { mutate, isPending, serverErrors } = useCompanyMutation({
    mutationKey: ['about'],
    mutationFn: (companyId, values: AboutValues) =>
      updateCompany(companyId, { website: values.website || null, about: values.about || null }),
    // The schema adds https:// to bare links, so reset to the saved values to show what was stored.
    onSuccess: (_company, values) => reset(values),
  });

  return (
    <FormSectionCard
      id={companySectionId('about')}
      icon={MdAutoStories}
      color="amber"
      titleId="company.section.about.title"
      subtitleId="company.section.about.subtitle"
      form={{
        onSubmit: handleSubmit((values) => mutate(values)),
        isDirty: formState.isDirty,
        isPending,
        serverError: serverErrors.general,
      }}
    >
      <Box className="grid gap-4">
        <FormTextField
          name="website"
          control={control}
          labelId="company.field.website"
          type="url"
          placeholder="yourcompany.com"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MdLanguage />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormTextField
          name="about"
          control={control}
          labelId="company.field.about"
          placeholder={$t({ id: 'company.field.about.placeholder' })}
          multiline
          minRows={5}
          helperText={`${formatNumber(about.length)} / ${formatNumber(COMPANY_LIMITS.about)}`}
          slotProps={{ htmlInput: { maxLength: COMPANY_LIMITS.about } }}
        />
      </Box>
    </FormSectionCard>
  );
}
