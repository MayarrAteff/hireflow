import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useIntl } from 'react-intl';

import { useJob } from '@/hooks/useJobs';

import { JobForm } from './JobForm';

type EditJobProps = {
  jobId: string;
};

export function EditJob({ jobId }: EditJobProps) {
  const { $t } = useIntl();
  const { data: job, isPending, isError } = useJob(jobId);

  if (isPending) {
    return (
      <Box className="tw-flex tw-justify-center tw-py-20">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" className="tw-mx-auto tw-max-w-4xl">
        {$t({ id: 'jobs.form.loadError' })}
      </Alert>
    );
  }

  return <JobForm job={job} />;
}
