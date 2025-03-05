export interface User {
  id: string;
  nmId: string;
  email: string;
  username: string;
  sem: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (nmId: string, email: string, password: string, username: string, sem: string) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  section?: string;
  marks?: number;
}