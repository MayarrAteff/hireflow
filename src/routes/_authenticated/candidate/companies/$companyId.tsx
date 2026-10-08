import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { CompanyDetails } from '@/containers/candidate/companies/CompanyDetails';
import { Permission } from '@/enum/permissions';

function CompanyDetailsRoute() {
  const { companyId } = Route.useParams();
  return <CompanyDetails key={companyId} companyId={companyId} />;
}

export const Route = createFileRoute('/_authenticated/candidate/companies/$companyId')({
  component: withPermission(CompanyDetailsRoute, Permission.ApplyToJobs),
});
