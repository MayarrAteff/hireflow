import type { IconType } from 'react-icons';
import { MdDescription, MdPayments, MdRocketLaunch, MdWork } from 'react-icons/md';

import type { JobFormStep } from '@/store/features/jobFormStepsSlice';
import type { AccentColor } from '@/styles/themes/accents';

/** One icon and colour per job form step, shared by the step path and the review sections. */
export const JOB_STEP_VISUALS: Record<JobFormStep, { icon: IconType; color: AccentColor }> = {
  basics: { icon: MdWork, color: 'violet' },
  details: { icon: MdDescription, color: 'amber' },
  compensation: { icon: MdPayments, color: 'emerald' },
  review: { icon: MdRocketLaunch, color: 'pink' },
};
