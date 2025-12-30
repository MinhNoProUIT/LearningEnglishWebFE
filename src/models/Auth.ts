// ==================== USER ====================
// User object từ database (bảng users)
export interface IUser {
  id: string;
  username: string;
  email: string;
  fullname?: string | null;
  birthday?: string | null;
  gender?: boolean | null; // true = Nam, false = Nữ
  address?: string | null;
  phonenumber?: string | null;
  created_date?: string;
  isactive?: boolean;
  isadmin: boolean; // true = admin, false = user thường
  balance?: number;
  image_url?: string;
  is_block?: boolean;
  is_verified?: boolean;
  firebase_uid?: string;
  isPremium?: boolean;
}

// ==================== REQUEST PAYLOADS ====================
export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  fullname?: string;
}

export interface IVerifyOTPPayload {
  email: string;
  otp: string;
}

export interface IResendOTPPayload {
  email: string;
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
}

export interface IVerifyOTPResponse {
  message: string;
}

export interface IResendOTPResponse {
  message: string;
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