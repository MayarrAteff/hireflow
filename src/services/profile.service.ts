import { getProfileRequest, updateProfileRequest } from '@/network/requests/profile';
import {
  createSignedUrlRequest,
  getPublicUrlRequest,
  removeFileRequest,
  uploadFileRequest,
} from '@/network/requests/storage';
import type { ProfileUpdatePayload } from '@/types/auth.types';

const CV_LINK_TTL_SECONDS = 60;
/** CV files are stored as `<userId>/<timestamp>-<name>`; the prefix keeps replacements from colliding. */
const CV_PREFIX_PATTERN = /^\d+-/;

export async function getProfile(userId: string) {
  const response = await getProfileRequest(userId);
  return response.data;
}

export async function updateProfile(userId: string, payload: ProfileUpdatePayload) {
  const response = await updateProfileRequest(userId, payload);
  return response.data;
}

/** Stores the cropped photo under a fixed name and busts caches with a version query. */
export async function uploadAvatar(userId: string, image: Blob) {
  const path = `${userId}/avatar.jpg`;
  await uploadFileRequest({ bucket: 'avatars', path, file: image });
  const { publicUrl } = getPublicUrlRequest('avatars', path).data;
  return updateProfile(userId, { avatar_url: `${publicUrl}?v=${Date.now()}` });
}

export async function removeAvatar(userId: string) {
  const { error } = await removeFileRequest('avatars', `${userId}/avatar.jpg`);
  if (error) throw error;
  return updateProfile(userId, { avatar_url: null });
}

export async function uploadCv(
  userId: string,
  file: File,
  previousPath: string | null,
  onProgress?: (percent: number) => void,
) {
  const safeName = file.name.replace(/[^\w.-]+/g, '-');
  const path = `${userId}/${Date.now()}-${safeName}`;
  await uploadFileRequest({ bucket: 'cvs', path, file, onProgress });
  const profile = await updateProfile(userId, { cv_path: path });
  // Clean up the old file only once the profile points at the new one.
  if (previousPath) await removeFileRequest('cvs', previousPath);
  return profile;
}

export async function removeCv(userId: string, path: string) {
  const { error } = await removeFileRequest('cvs', path);
  if (error) throw error;
  return updateProfile(userId, { cv_path: null });
}

export async function getCvUrl(path: string) {
  const { data, error } = await createSignedUrlRequest('cvs', path, CV_LINK_TTL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}

export function getCvFileName(path: string) {
  return (path.split('/').pop() ?? path).replace(CV_PREFIX_PATTERN, '');
}
