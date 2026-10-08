import type { ApplicationStage } from './application.types';
import type { Job } from './job.types';
import type { Offer } from './offer.types';

/** An application to one of the company's jobs, with just enough around it to chart the pipeline. */
export type AnalyticsApplication = {
  id: string;
  job_id: string;
  stage: ApplicationStage;
  created_at: string;
  updated_at: string;
  viewed_at: string | null;
  job: Pick<Job, 'title' | 'skills'>;
  candidate: { skills: string[] | null } | null;
  interviews: { id: string }[];
  offers: Pick<Offer, 'status' | 'responded_at'>[];
};
