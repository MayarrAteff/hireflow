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
  company_id: string | null;
  is_active: boolean;
  created_at: string;
  company?: Company | null;
};

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
