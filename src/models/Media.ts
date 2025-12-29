// src/models/Media.ts
// ==================== MEDIA LIBRARY MODELS ====================

// ==================== ENUMS ====================
export type MediaType = "video" | "podcast" | "music";
export type MediaSource = "youtube" | "manual_upload";

// ==================== PAGINATION ====================
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> {
  items: T[];
  pagination: IPagination;
}

// ==================== MEDIA ====================
export interface IMediaListItem {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  duration_seconds: number;
  views_count: number;
  published_at: string;
  type: MediaType;
  author_name: string;
  author_avatar: string;
}

export interface IMediaAuthor {
  id: string;
  name: string;
  avatar: string;
}

export interface IMediaCollection {
  id: string;
  title: string;
}

export interface IMediaTag {
  id: string;
  name: string;
  slug: string;
}

export interface IMediaDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  media_url: string;
  youtube_video_id: string | null;
  thumbnail_url: string;
  duration_seconds: number;
  views_count: number;
  transcript: string | null;
  published_at: string;
  type: MediaType;
  source: MediaSource;
  author: IMediaAuthor;
  collection: IMediaCollection | null;
  tags: IMediaTag[];
}

// ==================== AUTHOR ====================
export interface IAuthorListItem {
  id: string;
  name: string;
  avatar_url: string;
  youtube_channel_id: string | null;
  created_at: string;
  media_count: number;
}

export interface IAuthorDetail {
  id: string;
  name: string;
  avatar_url: string;
  bio: string | null;
  youtube_channel_id: string | null;
  created_at: string;
  media_count: number;
}

// ==================== COLLECTION ====================
export interface ICollectionListItem {
  id: string;
  title: string;
  thumbnail_url: string;
  total_episodes: number;
  author_name: string;
  created_at: string;
}

export interface ICollectionEpisode {
  id: string;
  title: string;
  slug: string;
  duration: number;
  views: number;
  thumbnail: string;
  published_at: string;
}

export interface ICollectionDetail {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  total_episodes: number;
  author: IMediaAuthor;
  episodes: ICollectionEpisode[];
}

// ==================== TAG ====================
export interface ITagItem {
  id: string;
  name: string;
  slug: string;
  media_count: number;
}

// ==================== REQUEST PAYLOADS ====================
export interface IMediaListParams {
  type?: MediaType;
  author_id?: string;
  collection_id?: string;
  tag_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ICreateFromYouTubeRequest {
  youtubeUrl: string;
  type?: MediaType;
  collectionId?: string | null;
  tags?: string[];
}

export interface ICreateManualRequest {
  title: string;
  description?: string;
  type?: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  authorId?: string;
  collectionId?: string;
  tags?: string[];
}

export interface IUpdateMediaRequest {
  title?: string;
  description?: string;
  collectionId?: string;
  thumbnailUrl?: string;
  transcript?: string;
  tags?: string[];
}

export interface ICreateAuthorRequest {
  name: string;
  avatarUrl?: string;
  bio?: string;
  youtubeChannelId?: string;
}

export interface IUpdateAuthorRequest {
  name?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface ICreateCollectionRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  authorId?: string;
}

export interface IUpdateCollectionRequest {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface ICreateTagRequest {
  name: string;
}

export interface ICreateBulkTagsRequest {
  names: string[];
}

export interface IBulkTagResult extends ITagItem {
  existed: boolean;
}

// ==================== RESPONSES ====================
export interface IViewCountResponse {
  viewsCount: number;
}

export interface IDeleteResponse {
  message: string;
}
