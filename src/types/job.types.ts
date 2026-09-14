import type { Dayjs } from 'dayjs';

import type { Company } from './auth.types';

export type JobStatus = 'draft' | 'published' | 'closed';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship';
export type WorkMode = 'onsite' | 'remote' | 'hybrid';

export type Job = {
  id: string;
  company_id: string;
  created_by: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  location: string | null;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  status: JobStatus;
  deadline: string | null;
  created_at: string;
};

/** Company details shown alongside a job; list views only fetch the name. */
export type JobCompany = Pick<Company, 'name'> & Partial<Pick<Company, 'industry' | 'website' | 'size' | 'about'>>;

/** A published job as candidates browse it. */
export type JobWithCompany = Job & { company: JobCompany | null };

export type JobSearchFilters = {
  search: string;
  employmentType: EmploymentType | null;
  workMode: WorkMode | null;
};

/** Columns the recruiter edits through the job form. */
export type JobFields = Omit<Job, 'id' | 'company_id' | 'created_by' | 'created_at'>;

export type CreateJobPayload = JobFields & Pick<Job, 'company_id' | 'created_by'>;

/** Form state: salaries stay strings so inputs can be empty; mapped to `JobFields` on save. */
export type JobFormValues = {
  title: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  salaryMin: string;
  salaryMax: string;
  currency: string;
  deadline: Dayjs | null;
};
