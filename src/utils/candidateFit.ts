import type { RecruiterApplication } from '@/types/application.types';

import { getSkillMatch } from './skillMatch';

/** How much each signal counts towards the fit score, before dropping signals that have no data. */
export const FIT_WEIGHTS = { skills: 60, experience: 25, rating: 15 } as const;

export type FitPart = keyof typeof FIT_WEIGHTS;

export type CandidateFit = {
  /** 0 to 100. */
  score: number;
  /** Each counted signal as 0 to 100, with the share of the score it actually carries. */
  parts: { key: FitPart; value: number; weight: number }[];
  match: ReturnType<typeof getSkillMatch>;
};

/**
 * Fit of each application within the group: skill match, experience relative to the most experienced person
 * in the group, and the recruiter's rating. Signals with no data (job without skills, nobody listing experience,
 * an unrated applicant) are left out and the rest re-weighted, so missing data never counts against anyone.
 */
export function getCandidateFits(jobSkills: string[], applications: RecruiterApplication[]): CandidateFit[] {
  const maxYears = Math.max(0, ...applications.map((application) => application.candidate.years_of_experience ?? 0));

  return applications.map((application) => {
    const match = getSkillMatch(jobSkills, application.candidate.skills ?? []);
    const values: Partial<Record<FitPart, number>> = {};
    if (jobSkills.length) values.skills = match.percent;
    if (maxYears > 0) values.experience = ((application.candidate.years_of_experience ?? 0) / maxYears) * 100;
    if (application.rating) values.rating = (application.rating / 5) * 100;

    const keys = Object.keys(values) as FitPart[];
    const totalWeight = keys.reduce((sum, key) => sum + FIT_WEIGHTS[key], 0);
    const score = totalWeight
      ? Math.round(keys.reduce((sum, key) => sum + (values[key] as number) * FIT_WEIGHTS[key], 0) / totalWeight)
      : 0;

    return {
      score,
      parts: keys.map((key) => ({
        key,
        value: Math.round(values[key] as number),
        weight: Math.round((FIT_WEIGHTS[key] / totalWeight) * 100),
      })),
      match,
    };
  });
}

/**
 * Indexes holding the highest value. Empty when nobody has a value or everyone ties, since a "leader" is only
 * useful when it tells people apart.
 */
export function getLeaders(values: (number | null | undefined)[]) {
  const numbers = values.map((value) => value ?? 0);
  const max = Math.max(...numbers);
  if (max <= 0 || numbers.every((value) => value === max)) return new Set<number>();
  return new Set(numbers.flatMap((value, index) => (value === max ? [index] : [])));
}
