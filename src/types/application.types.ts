export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

/** An application as the candidate sees it, with just enough of the job to list it. */
export type CandidateApplication = {
  id: string;
  stage: ApplicationStage;
  created_at: string;
  updated_at: string;
  /** Null when the job is no longer visible to the candidate (e.g. closed). */
  job: { title: string; company: { name: string } | null } | null;
};
