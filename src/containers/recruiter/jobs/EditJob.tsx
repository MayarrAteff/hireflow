import Alert from '@mui/material/Alert';
import { useIntl } from 'react-intl';

import { LoadingPage } from '@/components/shared/LoadingPage';
import { useJob } from '@/hooks/useJobs';

import { JobForm } from './JobForm';

type EditJobProps = {
  jobId: string;
};

export function EditJob({ jobId }: EditJobProps) {
  const { $t } = useIntl();
  const { data: job, isPending, isError } = useJob(jobId);

  if (isPending) {
    return <LoadingPage />;
  }

  if (isError) {
    return (
      <Alert severity="error" className="mx-auto max-w-4xl">
        {$t({ id: 'jobs.form.loadError' })}
      </Alert>
    );
  }

  return <JobForm job={job} />;
}
