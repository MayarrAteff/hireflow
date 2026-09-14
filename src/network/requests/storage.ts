import axios from 'axios';

import { config } from '@/config';
import { supabase } from '@/network/supabase';

export type StorageBucket = 'avatars' | 'company-logos' | 'cvs' | 'offer-letters';

type UploadRequest = {
  bucket: StorageBucket;
  path: string;
  file: Blob;
  onProgress?: (percent: number) => void;
};

/**
 * Uploads straight to the Storage REST endpoint instead of `supabase.storage.upload`,
 * because only XHR (axios) reports upload progress for the progress bar.
 */
export async function uploadFileRequest({ bucket, path, file, onProgress }: UploadRequest) {
  const { data } = await supabase.auth.getSession();
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');

  return axios.post(`${config.supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`, file, {
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${data.session?.access_token ?? config.supabaseAnonKey}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    onUploadProgress: (event) => {
      if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
    },
  });
}

export function removeFileRequest(bucket: StorageBucket, path: string) {
  return supabase.storage.from(bucket).remove([path]);
}

export function getPublicUrlRequest(bucket: StorageBucket, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path);
}

export function createSignedUrlRequest(bucket: StorageBucket, path: string, expiresInSeconds: number) {
  return supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
}
