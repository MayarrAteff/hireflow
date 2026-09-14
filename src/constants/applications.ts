import type { AccentColor } from '@/styles/themes/accents';
import type { ApplicationStage } from '@/types/application.types';

/** The forward path an application takes; `rejected` sits outside it. */
export const APPLICATION_PIPELINE: ApplicationStage[] = ['applied', 'screening', 'interview', 'offer', 'hired'];

export const APPLICATION_STAGE_COLOR: Record<ApplicationStage, AccentColor> = {
  applied: 'sky',
  screening: 'violet',
  interview: 'amber',
  offer: 'pink',
  hired: 'emerald',
  rejected: 'rose',
};
