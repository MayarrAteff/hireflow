import type { Company } from '@/types/auth.types';

export type CompanySection = 'brand' | 'about';

export type CompanyChecklistItem = { id: string; done: boolean; section: CompanySection };

export const companySectionId = (section: CompanySection) => `company-${section}`;

/** What candidates look for before applying, in the order a recruiter fills it in. */
export function getCompanyCompleteness(company: Company | null | undefined) {
  const items: CompanyChecklistItem[] = [
    { id: 'logo', done: Boolean(company?.logo_url), section: 'brand' },
    { id: 'industry', done: Boolean(company?.industry), section: 'brand' },
    { id: 'size', done: Boolean(company?.size), section: 'brand' },
    { id: 'website', done: Boolean(company?.website), section: 'about' },
    { id: 'about', done: Boolean(company?.about), section: 'about' },
  ];
  const percent = Math.round((items.filter((item) => item.done).length / items.length) * 100);

  return { items, percent, isComplete: percent === 100 };
}
