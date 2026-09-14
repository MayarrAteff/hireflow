import { createFileRoute } from '@tanstack/react-router';

import { withPermission } from '@/components/shared/withPermission';
import { CandidateProfile } from '@/containers/candidate/profile/CandidateProfile';
import { Permission } from '@/enum/permissions';

export const Route = createFileRoute('/_authenticated/candidate/profile')({
  component: withPermission(CandidateProfile, Permission.ManageOwnProfile),
});
