// src/models/User.ts

// ==================== ENUMS & COMMON ====================
export type SortOrder = "ASC" | "DESC" | "asc" | "desc";
export type PostRange = "all" | "lt10" | "from10to30" | "gt30";

// ==================== CORE USER MODELS ====================

// Tương ứng UserGetAllVModel
export interface IUser {
  id: string;
  username: string;
  email: string;
  fullname: string;
  birthday: string; // Backend có thể trả về string ISO
  gender: boolean;
  address: string;
  image_url: string;
  phonenumber: string;
  createddate: string; // Lưu ý: Backend dùng 'createddate' (không có underscore) ở GetAll
  isactive: boolean;
  isadmin: boolean;
  balance: number;
  is_block: boolean;
  is_verified?: boolean;
}

// Tương ứng UserUpdateVModel (khi gọi getById hoặc update xong)
export interface IUserDetail {
  username: string;
  phonenumber: string;
  email: string;
  birthday: string;
  gender: boolean;
  fullname: string;
  address: string;
  image_url: string;
  created_date: string; // Lưu ý: Backend dùng 'created_date' (có underscore) ở Update/GetById
}

// Tương ứng UserGetAllInPostVModel
export interface IUserInPost {
  id: string;
  username: string;
  image_url: string;
  total_posts: number;
  total_react_count: number;
  total_shared_count: number;
}

// Tương ứng TopFiveUserInPostVModel
export interface ITopUserInPost {
  id: string;
  username: string;
  image_url: string;
  total_posts: number;
}

// ==================== STATISTICS MODELS ====================

export interface IQuarterStats {
  currentQuarterCount: number;
  changePercent: number;
}

export interface IAttendanceStreak {
  longestFullname: string;
  longestStreak: number;
  shortestFullname: string;
  shortestStreak: number;
}

export interface ITopLearningUser {
  fullname: string;
  wordCount: number;
}

export interface ITopTopic {
  name: string;
  accessCount: number;
}

export interface ILearningProgress {
  fullname: string;
  image_url?: string;
  chuoi: number;
  tu: number;
  chude: number;
}

// ==================== REQUEST PAYLOADS ====================

// Param cho API GetAll
export interface IUserQueryParams {
  search?: string;
  page?: number;
  rowsPerPage?: number;
  sortBy?: string; // mặc định 'id'
  sortOrder?: SortOrder;
}

// Param cho API GetAllInPost và Search
export interface IPostUserQueryParams {
  page?: number;
  limit?: number;
  keyword?: string; // Dùng cho search
  postRange?: PostRange; // Dùng cho search
}

// Param cho API Learning
export interface ILearningQueryParams {
  search?: string;
  page?: number;
  rowsPerPage?: number;
  sortBy?: "fullname" | "chuoi" | "tu" | "chude";
  sortOrder?: SortOrder;
}

export interface ICreateUserRequest {
  username: string;
  email: string;
  password: string;
  phonenumber?: string;
  birthday?: string;
  gender?: boolean;
  fullname?: string;
  address?: string;
  image_url?: string;
  isactive?: boolean;
  isadmin?: boolean;
  balance?: number;
  firebase_uid?: string;
  isVerified?: boolean;
}

// Khi update user, chúng ta gửi FormData vì có upload ảnh
export interface IUpdateUserRequest {
  username?: string;
  phonenumber?: string;
  birthday?: string; // 'YYYY-MM-DD'
  gender?: boolean;
  fullname?: string;
  address?: string;
  image_url?: File; // File ảnh
}

// ==================== RESPONSES ====================

export interface IUserListResponse {
  users: IUser[];
  total: number;
}

export interface IPostUserListResponse {
  data: IUserInPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface IBlockUserResponse {
  message: string;
  data: {
    id: string;
    is_block: boolean;
  };
}

export interface IRemoveUserResponse {
  message: string;
  data: {
    id: string;
    isactive: boolean;
  };
}

export interface IPremiumResponse {
  message: string | boolean;
}
