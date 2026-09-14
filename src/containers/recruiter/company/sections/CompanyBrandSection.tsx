import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import { useForm } from 'react-hook-form';
import { MdStorefront } from 'react-icons/md';
import { useIntl } from 'react-intl';
import * as yup from 'yup';

import { FormSectionCard } from '@/components/Form/FormSectionCard';
import { FormTextField } from '@/components/Form/FormTextField';
import { CompanyLogoUploader } from '@/components/Profile/CompanyLogoUploader';
import { COMPANY_LIMITS, COMPANY_SIZES } from '@/constants/company';
import { useCompanyMutation } from '@/hooks/useCompanyMutation';
import { updateCompany } from '@/services/company.service';
import type { Company, CompanyDetailsValues } from '@/types/auth.types';
import { companySectionId } from '@/utils/companyCompleteness';
import { companyDetailsSchema } from '@/validations/company.validation.schema';

type BrandValues = Pick<CompanyDetailsValues, 'name' | 'industry' | 'size'>;

const brandSchema: yup.ObjectSchema<BrandValues> = companyDetailsSchema.pick(['name', 'industry', 'size']);

type CompanyBrandSectionProps = {
  company: Company;
};

export function CompanyBrandSection({ company }: CompanyBrandSectionProps) {
  const { $t } = useIntl();
  const { control, handleSubmit, reset, formState } = useForm<BrandValues>({
    resolver: yupResolver(brandSchema),
    defaultValues: { name: company.name, industry: company.industry ?? '', size: company.size ?? '' },
  });

  const { mutate, isPending, serverErrors } = useCompanyMutation({
    mutationKey: ['brand'],
    mutationFn: (companyId, values: BrandValues) =>
      updateCompany(companyId, { name: values.name, industry: values.industry || null, size: values.size || null }),
    onSuccess: (_company, values) => reset(values),
  });

  return (
    <FormSectionCard
      id={companySectionId('brand')}
      icon={MdStorefront}
      color="violet"
      titleId="company.section.brand.title"
      subtitleId="company.section.brand.subtitle"
      form={{
        onSubmit: handleSubmit((values) => mutate(values)),
        isDirty: formState.isDirty,
        isPending,
        serverError: serverErrors.general,
      }}
    >
      <Box className="grid items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <CompanyLogoUploader company={company} />
        <Box className="grid gap-4">
          <FormTextField
            name="name"
            control={control}
            labelId="company.field.name"
            autoComplete="organization"
            slotProps={{ htmlInput: { maxLength: COMPANY_LIMITS.name } }}
          />
          <Box className="grid gap-4 sm:grid-cols-2">
            <FormTextField
              name="industry"
              control={control}
              labelId="company.field.industry"
              placeholder={$t({ id: 'company.field.industry.placeholder' })}
              slotProps={{ htmlInput: { maxLength: COMPANY_LIMITS.industry } }}
            />
            <FormTextField select name="size" control={control} labelId="company.field.size">
              <MenuItem value="">
                <em>{$t({ id: 'company.field.size.none' })}</em>
              </MenuItem>
              {COMPANY_SIZES.map((size) => (
                <MenuItem key={size} value={size}>
                  {$t({ id: 'jobs.details.companySize' }, { size })}
                </MenuItem>
              ))}
            </FormTextField>
          </Box>
        </Box>
      </Box>
    </FormSectionCard>
  );
}
