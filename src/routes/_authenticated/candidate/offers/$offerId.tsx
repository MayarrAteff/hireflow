import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { OfferView } from '@/containers/candidate/offers/OfferView';
import { Permission } from '@/enum/permissions';

function OfferRoute() {
  const { offerId } = Route.useParams();
  return <OfferView key={offerId} offerId={offerId} />;
}

export const Route = createFileRoute('/_authenticated/candidate/offers/$offerId')({
  component: withPermission(OfferRoute, Permission.ApplyToJobs),
});
