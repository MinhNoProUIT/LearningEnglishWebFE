// ==================== USER ====================
export interface IUser {
  id: string;
  username: string;
  email: string;
  role: boolean; // true = admin, false = user thường
  is_verified?: boolean;
  isactive?: boolean;
  isadmin?: boolean;
  balance?: number;
}

// ==================== REQUEST PAYLOADS ====================
export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  newPassword: string;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}

// ==================== RESPONSES ====================
export interface ILoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: boolean;
}

export interface IRegisterResponse {
  message: string;
  user: IUser;
}

export interface ILogoutResponse {
  message: string;
}

export interface IGetMeResponse {
  id: string;
  username: string;
  email: string;
  role: boolean;
}

export interface IChangePasswordResponse {
  message: string;
}

export interface IForgotPasswordResponse {
  message: string;
  token: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export interface IRefreshTokenResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

// ==================== ERROR RESPONSE ====================
export interface IAuthError {
  error?: string;
  message?: string;
}

// ==================== AUTH CONTEXT STATE ====================
export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ==================== TOKEN STORAGE KEYS ====================
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "auth_user",
} as const;