export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

/** An application as the candidate sees it, with just enough of the job to list it. */
export type CandidateApplication = {
  id: string;
  job_id: string;
  stage: ApplicationStage;
  created_at: string;
  updated_at: string;
  /** Null when the job is no longer visible to the candidate (e.g. closed). */
  job: { title: string; company: { name: string } | null } | null;
};

/** The candidate's own application for one job, as shown on the job page. */
export type JobApplication = {
  id: string;
  stage: ApplicationStage;
  created_at: string;
  cv_path: string | null;
  cover_letter: string | null;
};

export type CreateApplicationPayload = {
  job_id: string;
  candidate_id: string;
  cv_path: string;
  cover_letter: string | null;
};

/** Which CV goes with an application: the one saved on the profile, or a file picked for this job. */
export type ApplicationCv = { source: 'profile'; path: string } | { source: 'upload'; file: File };
