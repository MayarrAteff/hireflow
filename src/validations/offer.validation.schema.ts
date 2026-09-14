import type { Dayjs } from 'dayjs';
import * as yup from 'yup';

import { OFFER_DECLINE_REASON_MAX, OFFER_MESSAGE_MAX } from '@/constants/offers';
import { dayjs } from '@/utils/dayjs';

export type OfferFormValues = {
  salary: string;
  currency: string;
  startDate: Dayjs | null;
  expiresAt: Dayjs | null;
  message: string;
};

export type DeclineOfferFormValues = {
  reason: string;
};

const validDate = () =>
  yup
    .mixed<Dayjs>()
    .nullable()
    .defined()
    .test('required', 'validation.required', (value) => Boolean(value?.isValid()));

/** Messages are i18n ids; fields translate them when rendering. */
export const offerSchema: yup.ObjectSchema<OfferFormValues> = yup.object({
  salary: yup
    .string()
    .trim()
    .required('validation.required')
    .test('positive', 'validation.offer.salary', (value) => Number.isFinite(Number(value)) && Number(value) > 0),
  currency: yup.string().trim().required('validation.required').max(10, 'validation.tooLong'),
  startDate: validDate().test(
    'future',
    'validation.offer.startPast',
    (value) => !value?.isValid() || value.isAfter(dayjs(), 'day'),
  ),
  expiresAt: validDate()
    .test('notPast', 'validation.offer.expiryPast', (value) => !value?.isValid() || !value.isBefore(dayjs(), 'day'))
    .test('beforeStart', 'validation.offer.expiryAfterStart', function (value) {
      const { startDate } = this.parent as OfferFormValues;
      return !value?.isValid() || !startDate?.isValid() || !value.isAfter(startDate, 'day');
    }),
  message: yup.string().trim().defined().max(OFFER_MESSAGE_MAX, 'validation.tooLong'),
});

export const declineOfferSchema: yup.ObjectSchema<DeclineOfferFormValues> = yup.object({
  reason: yup.string().trim().defined().max(OFFER_DECLINE_REASON_MAX, 'validation.tooLong'),
});
