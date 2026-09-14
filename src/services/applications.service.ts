import { isAxiosError } from 'axios';

import type { PostgrestErrorResponse } from '@/network/interceptor';
import {
  createApplicationRequest,
  deleteApplicationRequest,
  getCandidateApplicationForJobRequest,
  getCandidateApplicationsRequest,
  getJobApplicationsRequest,
  updateApplicationRequest,
} from '@/network/requests/applications';
import { removeFileRequest, uploadFileRequest } from '@/network/requests/storage';
import type { ApplicationCv, ApplicationUpdatePayload } from '@/types/application.types';
import { getTranslation } from '@/utils/getTranslation';

/** Postgres unique violation: the candidate already applied to this job. */
const UNIQUE_VIOLATION = '23505';

export async function getCandidateApplications(candidateId: string) {
  const response = await getCandidateApplicationsRequest(candidateId);
  return response.data;
}

/** The candidate's application for a job, or null if they haven't applied. */
export async function getCandidateApplicationForJob(candidateId: string, jobId: string) {
  const response = await getCandidateApplicationForJobRequest(candidateId, jobId);
  return response.data[0] ?? null;
}

type ApplyToJobInput = {
  candidateId: string;
  jobId: string;
  cv: ApplicationCv;
  coverLetter: string;
  onUploadProgress?: (percent: number) => void;
};

export async function applyToJob({ candidateId, jobId, cv, coverLetter, onUploadProgress }: ApplyToJobInput) {
  let uploadedPath: string | null = null;
  if (cv.source === 'upload') {
    const safeName = cv.file.name.replace(/[^\w.-]+/g, '-');
    // Same `<userId>/` folder as the profile CV, so the storage policies for recruiters apply unchanged.
    uploadedPath = `${candidateId}/applications/${jobId}-${Date.now()}-${safeName}`;
    await uploadFileRequest({ bucket: 'cvs', path: uploadedPath, file: cv.file, onProgress: onUploadProgress });
  }

  try {
    const response = await createApplicationRequest({
      job_id: jobId,
      candidate_id: candidateId,
      cv_path: uploadedPath ?? (cv.source === 'profile' ? cv.path : ''),
      cover_letter: coverLetter.trim() || null,
    });
    return response.data;
  } catch (error) {
    // Don't leave an orphaned file behind when the application itself fails.
    if (uploadedPath) await removeFileRequest('cvs', uploadedPath);
    if (isAxiosError<PostgrestErrorResponse>(error) && error.response?.data?.code === UNIQUE_VIOLATION) {
      throw new Error(getTranslation('apply.error.duplicate'));
    }
    throw error;
  }
}

export async function withdrawApplication(applicationId: string) {
  await deleteApplicationRequest(applicationId);
}

export async function getJobApplications(jobId: string) {
  const response = await getJobApplicationsRequest(jobId);
  return response.data;
}

export async function updateApplication(applicationId: string, payload: ApplicationUpdatePayload) {
  await updateApplicationRequest(applicationId, payload);
}

/** Saves several board moves at once; PostgREST has no bulk update without insert rights, so one PATCH per row. */
export async function saveApplicationMoves(moves: { id: string; payload: ApplicationUpdatePayload }[]) {
  await Promise.all(moves.map(({ id, payload }) => updateApplicationRequest(id, payload)));
}
