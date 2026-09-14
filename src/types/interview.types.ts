import type { ApplicationStage } from './application.types';

export type InterviewType = 'phone' | 'video' | 'onsite';

export type Interview = {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration_minutes: number;
  type: InterviewType;
  location_or_link: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
};

export type InterviewPayload = Pick<
  Interview,
  'application_id' | 'scheduled_at' | 'duration_minutes' | 'type' | 'location_or_link' | 'notes' | 'created_by'
>;

/** An interview with the applicant and job it belongs to, for the recruiter's Interviews page. */
export type InterviewWithContext = Interview & {
  application: {
    id: string;
    stage: ApplicationStage;
    job: { id: string; title: string };
    candidate: { id: string; full_name: string; email: string; avatar_url: string | null; headline: string | null };
  };
};
