import type { Profile } from './auth.types';
import type { Interview } from './interview.types';
import type { Offer, OfferSummary } from './offer.types';

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
  offers: OfferSummary[];
};

/** The candidate's own application for one job, as shown on the job page. */
export type JobApplication = {
  id: string;
  stage: ApplicationStage;
  created_at: string;
  cv_path: string | null;
  cover_letter: string | null;
  interviews: Interview[];
  /** Never includes drafts; row-level security hides them from candidates. */
  offers: Offer[];
};

/** The applicant details a recruiter sees; readable only for people who applied to their company. */
export type ApplicantProfile = Pick<
  Profile,
  | 'id'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'avatar_url'
  | 'headline'
  | 'bio'
  | 'location'
  | 'skills'
  | 'years_of_experience'
  | 'linkedin_url'
  | 'portfolio_url'
  | 'github_url'
>;

/** An application on one of the recruiter's jobs, with the applicant and their interviews. */
export type RecruiterApplication = {
  id: string;
  job_id: string;
  candidate_id: string;
  stage: ApplicationStage;
  position: number;
  rating: number | null;
  cover_letter: string | null;
  cv_path: string | null;
  created_at: string;
  updated_at: string;
  candidate: ApplicantProfile;
  interviews: Interview[];
  offers: Offer[];
};

export type ApplicationUpdatePayload = Partial<Pick<RecruiterApplication, 'stage' | 'position' | 'rating'>>;

export type CreateApplicationPayload = {
  job_id: string;
  candidate_id: string;
  cv_path: string;
  cover_letter: string | null;
};

/** Which CV goes with an application: the one saved on the profile, or a file picked for this job. */
export type ApplicationCv = { source: 'profile'; path: string } | { source: 'upload'; file: File };
