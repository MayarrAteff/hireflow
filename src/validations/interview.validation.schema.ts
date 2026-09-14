import type { Dayjs } from 'dayjs';
import * as yup from 'yup';

import type { InterviewType } from '@/types/interview.types';

export const INTERVIEW_DURATIONS = [15, 30, 45, 60, 90];
export const INTERVIEW_TYPES: InterviewType[] = ['video', 'phone', 'onsite'];
export const INTERVIEW_NOTES_MAX = 1000;

export type InterviewFormValues = {
  date: Dayjs | null;
  time: Dayjs | null;
  durationMinutes: number;
  type: InterviewType;
  locationOrLink: string;
  notes: string;
  /** Only offered while the applicant is still before the Interview stage. */
  moveToInterviewStage: boolean;
};

/** Combines the separate date and time pickers into one moment. */
export function combineDateAndTime(date: Dayjs, time: Dayjs) {
  return date.hour(time.hour()).minute(time.minute()).second(0).millisecond(0);
}

/** Messages are i18n ids; fields translate them when rendering. */
export const interviewSchema: yup.ObjectSchema<InterviewFormValues> = yup.object({
  date: yup
    .mixed<Dayjs>()
    .nullable()
    .defined()
    .test('required', 'validation.required', (value) => Boolean(value?.isValid())),
  time: yup
    .mixed<Dayjs>()
    .nullable()
    .defined()
    .test('required', 'validation.required', (value) => Boolean(value?.isValid()))
    .test('future', 'validation.interview.past', function (value) {
      const { date } = this.parent as InterviewFormValues;
      if (!value?.isValid() || !date?.isValid()) return true;
      return combineDateAndTime(date, value).isAfter(new Date());
    }),
  durationMinutes: yup.number().oneOf(INTERVIEW_DURATIONS).required('validation.required'),
  type: yup.mixed<InterviewType>().oneOf(INTERVIEW_TYPES).required('validation.required'),
  locationOrLink: yup.string().trim().defined().max(500, 'validation.tooLong'),
  notes: yup.string().trim().defined().max(INTERVIEW_NOTES_MAX, 'validation.tooLong'),
  moveToInterviewStage: yup.boolean().defined(),
});
