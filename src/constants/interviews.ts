import type { IconType } from 'react-icons';
import { MdApartment, MdPhone, MdVideocam } from 'react-icons/md';

import type { AccentColor } from '@/styles/themes/accents';
import type { Interview, InterviewType } from '@/types/interview.types';

export const INTERVIEW_TYPE_VISUALS: Record<InterviewType, { icon: IconType; color: AccentColor }> = {
  video: { icon: MdVideocam, color: 'violet' },
  phone: { icon: MdPhone, color: 'sky' },
  onsite: { icon: MdApartment, color: 'amber' },
};

/** The soonest interview that hasn't ended yet, if any. */
export function getNextInterview(interviews: Interview[] | undefined) {
  const now = Date.now();
  return [...(interviews ?? [])]
    .filter((interview) => new Date(interview.scheduled_at).getTime() + interview.duration_minutes * 60_000 > now)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0];
}

export const isMeetingUrl = (value: string | null) => Boolean(value && /^https?:\/\//i.test(value.trim()));
