import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Fragment, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { APPLICATION_PIPELINE } from '@/constants/applications';
import { useCandidateApplications } from '@/hooks/useApplications';
import type { ApplicationStage } from '@/types/application.types';
import { useAuth } from '@/utils/hooks/useAuth';

import { ApplicationRow } from '../components/ApplicationRow';

const ButtonLink = createLink(Button);

type StageFilter = ApplicationStage | 'all';
const STAGE_FILTERS: StageFilter[] = ['all', ...APPLICATION_PIPELINE, 'rejected'];

/** Every job the candidate applied to, most recently updated first, filterable by stage. */
export function MyApplications() {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const { data: applications = [], isPending } = useCandidateApplications(profile?.id);
  const [filter, setFilter] = useState<StageFilter>('all');

  const countFor = (stage: StageFilter) =>
    stage === 'all' ? applications.length : applications.filter((item) => item.stage === stage).length;
  const visible = filter === 'all' ? applications : applications.filter((item) => item.stage === filter);

  const browseButton = (
    <ButtonLink variant="contained" size="large" startIcon={<MdSearch />} to="/candidate/jobs">
      {$t({ id: 'jobs.browse.cta' })}
    </ButtonLink>
  );

  return (
    <Box className="mx-auto flex max-w-4xl flex-col gap-6">
      <Box className="flex flex-wrap items-center justify-between gap-4">
        <Box>
          <Typography variant="h2">{$t({ id: 'candidate.applications.pageTitle' })}</Typography>
          <Typography color="text.secondary">{$t({ id: 'candidate.applications.subtitle' })}</Typography>
        </Box>
        {applications.length > 0 && browseButton}
      </Box>

      {isPending && (
        <Card>
          <CardContent className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} height={56} />
            ))}
          </CardContent>
        </Card>
      )}

      {!isPending && applications.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <EmptyJobsIllustration className="mb-4 w-48" />
              <Typography variant="h3" className="mb-2">
                {$t({ id: 'candidate.applications.empty.title' })}
              </Typography>
              <Typography color="text.secondary" className="mb-6 max-w-md">
                {$t({ id: 'candidate.applications.empty.body' })}
              </Typography>
              {browseButton}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {applications.length > 0 && (
        <>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filter}
            onChange={(_event, value: StageFilter | null) => value && setFilter(value)}
            className="flex-wrap"
          >
            {STAGE_FILTERS.map((stage) => (
              <ToggleButton key={stage} value={stage} className="gap-2 px-4">
                {$t({ id: stage === 'all' ? 'jobs.list.filter.all' : `application.stage.${stage}` })}
                <Chip size="small" label={countFor(stage)} className="h-5" />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Card>
            <CardContent className="flex flex-col p-2">
              {visible.map((application, index) => (
                <Fragment key={application.id}>
                  {index > 0 && <Divider className="mx-2" />}
                  <ApplicationRow application={application} />
                </Fragment>
              ))}
              {visible.length === 0 && (
                <Typography color="text.secondary" className="py-10 text-center">
                  {$t({ id: 'candidate.applications.filterEmpty' })}
                </Typography>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
