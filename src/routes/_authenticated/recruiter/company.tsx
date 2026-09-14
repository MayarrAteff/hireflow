import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { CompanyProfile } from '@/containers/recruiter/company/CompanyProfile';
import { Permission } from '@/enum/permissions';

export const Route = createFileRoute('/_authenticated/recruiter/company')({
  component: withPermission(CompanyProfile, Permission.ManageCompanyProfile),
});
