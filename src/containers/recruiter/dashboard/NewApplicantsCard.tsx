import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { createLink, Link } from '@tanstack/react-router';
import { MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { PiUserPlusDuotone } from 'react-icons/pi';
import { useIntl } from 'react-intl';

import { NewApplicantDot } from '@/components/Jobs/NewApplicantDot';
import { ApplicantAvatar } from '@/components/Profile/ApplicantAvatar';
import { IconTile } from '@/components/UI/IconTile';
import { useCompanyNewApplicants } from '@/hooks/useApplications';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import { useAuth } from '@/utils/hooks/useAuth';
import { useJobFormatters } from '@/utils/hooks/useJobFormatters';

const ListItemLink = createLink(ListItemButton);
const NEW_APPLICANTS_LIMIT = 5;

type NewApplicantsCardProps = {
  /** Unseen applicants across all jobs, from the company jobs query (the list itself is capped). */
  total: number;
  loading: boolean;
};

/** Applicants nobody at the company has opened yet; each one opens straight into its drawer, which marks it seen. */
export function NewApplicantsCard({ total, loading }: NewApplicantsCardProps) {
  const { $t, formatNumber } = useIntl();
  const { formatRelativeDay } = useJobFormatters();
  const { profile } = useAuth();
  const { data: applicants = [], isPending } = useCompanyNewApplicants(profile?.company_id, NEW_APPLICANTS_LIMIT);

  const isLoading = loading || (Boolean(profile?.company_id) && isPending);
  const remaining = Math.max(0, total - applicants.length);

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Box className="mb-3 flex items-center gap-3">
          <IconTile icon={PiUserPlusDuotone} color="sky" />
          <Box className="min-w-0 flex-1">
            <Typography variant="h5">{$t({ id: 'dashboard.newApplicants.title' })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: 'dashboard.newApplicants.subtitle' })}
            </Typography>
          </Box>
          {total > 0 && (
            <Chip
              label={formatNumber(total)}
              size="small"
              sx={{ bgcolor: ACCENT_COLORS.sky, color: '#fff', fontWeight: 700 }}
            />
          )}
        </Box>

        {isLoading && [0, 1, 2].map((row) => <Skeleton key={row} height={60} />)}

        {!isLoading && applicants.length === 0 && (
          <Box className="flex flex-col items-center gap-2 py-6 text-center">
            <Box component={MdCheckCircle} size={40} sx={{ color: ACCENT_COLORS.emerald }} aria-hidden />
            <Typography fontWeight={600}>{$t({ id: 'dashboard.newApplicants.empty.title' })}</Typography>
            <Typography variant="body2" color="text.secondary" className="max-w-xs">
              {$t({ id: 'dashboard.newApplicants.empty.body' })}
            </Typography>
          </Box>
        )}

        {!isLoading && applicants.length > 0 && (
          <Box className="flex flex-col gap-1">
            {applicants.map((applicant) => {
              const name = applicant.candidate.full_name || applicant.candidate.email;
              return (
                <ListItemLink
                  key={applicant.id}
                  to="/recruiter/jobs/$jobId"
                  params={{ jobId: applicant.job_id }}
                  search={{ tab: 'applicants', applicant: applicant.id }}
                  className="gap-3 rounded-xl px-2"
                >
                  <ApplicantAvatar candidate={applicant.candidate} size={40} />
                  <Box className="min-w-0 flex-1">
                    <Box className="flex min-w-0 items-center gap-2">
                      <Typography fontWeight={600} noWrap>
                        {name}
                      </Typography>
                      <NewApplicantDot />
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {$t({ id: 'dashboard.newApplicants.appliedTo' }, { job: applicant.job.title })}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" className="shrink-0 whitespace-nowrap">
                    {formatRelativeDay(applicant.created_at)}
                  </Typography>
                </ListItemLink>
              );
            })}
          </Box>
        )}

        {remaining > 0 && (
          <Button
            size="small"
            component={Link}
            to="/recruiter/jobs"
            endIcon={<MdArrowForward className="rtl:rotate-180" />}
            className="mt-3"
          >
            {$t({ id: 'dashboard.newApplicants.more' }, { count: remaining })}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
