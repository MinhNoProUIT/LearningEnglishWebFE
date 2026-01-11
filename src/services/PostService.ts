// src/services/PostService.ts
// ==================== POST API SERVICE ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";

// ==================== API BASE URL ====================
// Use localhost for local dev, or production URL when deployed
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ==================== INTERFACES ====================
export interface EnglishTip {
    word: string;
    meaning: string;
    example?: string;
}

export interface PostUser {
    id: string;
    username: string;
    fullname?: string;
    image_url?: string;
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    timestamp: string;
}

export interface Post {
    id: string;
    userId: string;
    content: string;
    imageUrl?: string;
    reactCount: number;
    commentCount: number;
    createdDate: string;
    user: PostUser;
    englishTip?: EnglishTip;
    isLiked: boolean;
    comments?: Comment[];
}

export interface PostPagination {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
}

export interface PostListResponse {
    posts: Post[];
    pagination: PostPagination;
}

export interface PostStats {
    totalPosts: number;
    totalReactions: number;
    totalComments: number;
    postsWithVocab: number;
    engagementRate: string;
}

export interface CreatePostRequest {
    content: string;
    imageUrl?: string;
    image?: File; // For file upload
    englishTip?: EnglishTip;
}

export interface UpdatePostRequest {
    content?: string;
    imageUrl?: string;
    englishTip?: EnglishTip;
}

export interface PostQueryParams {
    page?: number;
    limit?: number;
}

export interface SearchQueryParams extends PostQueryParams {
    q: string;
}

export interface ApiResponse<T> {
    Success: boolean;
    Data: T;
    Message?: string;
}

// ==================== POST API ====================
export const postApi = createApi({
    reducerPath: "postApi",
    baseQuery: createBaseQuery(API_URL),
    tagTypes: ["Post", "MyPosts", "LikedPosts", "PostStats"],
    endpoints: (builder) => ({
        /**
         * GET /posts
         * Lấy tất cả bài viết (feed)
         */
        getAllPosts: builder.query<ApiResponse<PostListResponse>, PostQueryParams>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                return `/posts?${queryParams.toString()}`;
            },
            providesTags: (result) =>
                result?.Data?.posts
                    ? [
                        ...result.Data.posts.map(({ id }) => ({ type: "Post" as const, id })),
                        { type: "Post", id: "LIST" },
                    ]
                    : [{ type: "Post", id: "LIST" }],
        }),

        /**
         * GET /posts/:id
         * Lấy chi tiết bài viết
         */
        getPostById: builder.query<ApiResponse<Post>, string>({
            query: (id) => `/posts/${id}`,
            providesTags: (result, error, id) => [{ type: "Post", id }],
        }),

        /**
         * GET /posts/me
         * Lấy bài viết của tôi
         */
        getMyPosts: builder.query<ApiResponse<PostListResponse>, PostQueryParams>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                return `/posts/me?${queryParams.toString()}`;
            },
            providesTags: ["MyPosts"],
        }),

        /**
         * GET /posts/me/stats
         * Lấy thống kê bài viết của tôi
         */
        getMyStats: builder.query<ApiResponse<PostStats>, void>({
            query: () => `/posts/me/stats`,
            providesTags: ["PostStats"],
        }),

        /**
         * GET /posts/liked
         * Lấy bài viết đã thích
         */
        getLikedPosts: builder.query<ApiResponse<PostListResponse>, PostQueryParams>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                return `/posts/liked?${queryParams.toString()}`;
            },
            providesTags: ["LikedPosts"],
        }),

        /**
         * GET /posts/search
         * Tìm kiếm bài viết
         */
        searchPosts: builder.query<ApiResponse<PostListResponse>, SearchQueryParams>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                queryParams.append("q", params.q);
                if (params?.page) queryParams.append("page", params.page.toString());
                if (params?.limit) queryParams.append("limit", params.limit.toString());
                return `/posts/search?${queryParams.toString()}`;
            },
        }),

        /**
         * GET /posts/user/:userId
         * Lấy bài viết của người dùng khác
         */
        getPostsByUser: builder.query<
            ApiResponse<PostListResponse>,
            { userId: string } & PostQueryParams
        >({
            query: ({ userId, page, limit }) => {
                const queryParams = new URLSearchParams();
                if (page) queryParams.append("page", page.toString());
                if (limit) queryParams.append("limit", limit.toString());
                return `/posts/user/${userId}?${queryParams.toString()}`;
            },
        }),

        /**
         * GET /posts/user/:userId/stats
         * Lấy thống kê của người dùng khác
         */
        getUserPostStats: builder.query<ApiResponse<PostStats>, string>({
            query: (userId) => `/posts/user/${userId}/stats`,
        }),

        /**
         * POST /posts
         * Tạo bài viết mới (hỗ trợ upload ảnh)
         */
        createPost: builder.mutation<ApiResponse<Post>, CreatePostRequest>({
            query: (body) => {
                // If image file is provided, use FormData
                if (body.image) {
                    const formData = new FormData();
                    formData.append("image", body.image);
                    formData.append("content", body.content);
                    if (body.englishTip?.word) {
                        formData.append("englishTip[word]", body.englishTip.word);
                    }
                    if (body.englishTip?.meaning) {
                        formData.append("englishTip[meaning]", body.englishTip.meaning);
                    }
                    if (body.englishTip?.example) {
                        formData.append("englishTip[example]", body.englishTip.example);
                    }
                    return {
                        url: "/posts",
                        method: "POST",
                        body: formData,
                        formData: true,
                    };
                }
                // Otherwise use JSON
                return {
                    url: "/posts",
                    method: "POST",
                    body: {
                        content: body.content,
                        imageUrl: body.imageUrl,
                        englishTip: body.englishTip,
                    },
                };
            },
            invalidatesTags: [
                { type: "Post", id: "LIST" },
                "MyPosts",
                "PostStats",
            ],
        }),

        /**
         * PUT /posts/:id
         * Cập nhật bài viết
         */
        updatePost: builder.mutation<
            ApiResponse<Post>,
            { id: string; data: UpdatePostRequest }
        >({
            query: ({ id, data }) => ({
                url: `/posts/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Post", id },
                { type: "Post", id: "LIST" },
                "MyPosts",
            ],
        }),

        /**
         * DELETE /posts/:id
         * Xóa bài viết
         */
        deletePost: builder.mutation<ApiResponse<void>, string>({
            query: (id) => ({
                url: `/posts/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Post", id },
                { type: "Post", id: "LIST" },
                "MyPosts",
                "PostStats",
            ],
        }),

        /**
         * POST /posts/:id/react
         * Thích/bỏ thích bài viết
         */
        reactToPost: builder.mutation<
            ApiResponse<{ isLiked: boolean; message: string }>,
            string
        >({
            query: (id) => ({
                url: `/posts/${id}/react`,
                method: "POST",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Post", id },
                "LikedPosts",
            ],
        }),

        /**
         * POST /posts/:id/comments
         * Thêm bình luận
         */
        addComment: builder.mutation<
            ApiResponse<Comment>,
            { postId: string; content: string }
        >({
            query: ({ postId, content }) => ({
                url: `/posts/${postId}/comments`,
                method: "POST",
                body: { content },
            }),
            invalidatesTags: (result, error, { postId }) => [
                { type: "Post", id: postId },
                { type: "Post", id: "LIST" }, // Refetch post list to show new comment
            ],
        }),
    }),
});

// ==================== EXPORT HOOKS ====================
export const {
    useGetAllPostsQuery,
    useLazyGetAllPostsQuery,
    useGetPostByIdQuery,
    useGetMyPostsQuery,
    useLazyGetMyPostsQuery,
    useGetMyStatsQuery,
    useGetLikedPostsQuery,
    useLazyGetLikedPostsQuery,
    useSearchPostsQuery,
    useLazySearchPostsQuery,
    useGetPostsByUserQuery,
    useGetUserPostStatsQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useReactToPostMutation,
    useAddCommentMutation,
} = postApi;
