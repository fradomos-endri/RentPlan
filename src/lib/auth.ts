// Auth utility functions
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  birthdate: string;
  gender: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const getStoredUser = (): User | null => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

export const isLoggedIn = (): boolean => {
  return !!getStoredToken() && !!getStoredUser();
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const setAuthData = (user: User, token: string) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
};

export const updateStoredUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const updateStoredToken = (token: string): void => {
  localStorage.setItem('token', token);
};
