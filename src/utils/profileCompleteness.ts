import type { Profile } from '@/types/auth.types';

export type ProfileSection = 'basics' | 'about' | 'contact' | 'skills' | 'cv';

export type ProfileChecklistItem = { id: string; done: boolean; section: ProfileSection };

/** DOM id of each profile section, so the checklist can scroll to it. */
export const profileSectionId = (section: ProfileSection) => `profile-${section}`;

/** The details recruiters look at first, in the order a candidate would fill them in. */
export function getProfileCompleteness(profile: Profile | null) {
  const items: ProfileChecklistItem[] = [
    { id: 'photo', done: Boolean(profile?.avatar_url), section: 'basics' },
    { id: 'name', done: Boolean(profile?.full_name.trim()), section: 'basics' },
    { id: 'headline', done: Boolean(profile?.headline), section: 'basics' },
    { id: 'location', done: Boolean(profile?.location), section: 'basics' },
    { id: 'bio', done: Boolean(profile?.bio), section: 'about' },
    { id: 'phone', done: Boolean(profile?.phone), section: 'contact' },
    { id: 'skills', done: Boolean(profile?.skills?.length), section: 'skills' },
    { id: 'cv', done: Boolean(profile?.cv_path), section: 'cv' },
  ];
  const percent = Math.round((items.filter((item) => item.done).length / items.length) * 100);

  return { items, percent };
}
