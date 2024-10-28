export interface AuthUser {
  id?: string;
  email?: string;
}

export interface AuthState {
  isAuthenticated: boolean | undefined;
  user: AuthUser | null | undefined;
  isInitialized: boolean;
}

export const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null as unknown as AuthUser,
};
