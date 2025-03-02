export type User = {
  first_name: string;
  last_name: string;
  email: string;
  id: number;
  has_access_to: number[];
  is_active: boolean;
  role: 0 | 1 | 2 | 3;
  groups?: string[];
  is_superuser?: boolean;
  last_login?: null;
  user_permissions?: string[];
};
