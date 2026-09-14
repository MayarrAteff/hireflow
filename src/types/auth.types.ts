export type UserRole = 'recruiter' | 'candidate' | 'admin';

export type Company = {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  about: string | null;
  created_at: string;
};

export type CreateCompanyPayload = {
  name: string;
  website: string;
  industry: string;
};

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  cv_path: string | null;
  location: string | null;
  skills: string[];
  years_of_experience: number | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  company_id: string | null;
  is_active: boolean;
  created_at: string;
  company?: Company | null;
};

/** Columns a user can change on their own profile. */
export type ProfileUpdatePayload = Partial<
  Pick<
    Profile,
    | 'full_name'
    | 'headline'
    | 'location'
    | 'bio'
    | 'years_of_experience'
    | 'phone'
    | 'linkedin_url'
    | 'portfolio_url'
    | 'github_url'
    | 'skills'
    | 'avatar_url'
    | 'cv_path'
  >
>;

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Exclude<UserRole, 'admin'>;
};
