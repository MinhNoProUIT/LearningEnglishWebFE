// src/components/profile/MyPostsTab.tsx
"use client";
import React from "react";
import {
    Box,
    Typography,
    Stack,
    Avatar,
    Chip,
    CircularProgress,
    Paper,
    Grid,
    Skeleton,
} from "@mui/material";
import {
    Heart,
    MessageCircle,
    FileText,
    BookOpen,
    TrendingUp,
    Sparkles,
} from "lucide-react";
import { useGetMyPostsQuery, useGetMyStatsQuery } from "@/services/PostService";
import { formatDate } from "@/utils/formatDate";

const theme = {
    colors: {
        primary: "#10b981",
        primaryDark: "#059669",
        primaryLight: "#34d399",
    },
};

// Stat Item Component
interface StatItemProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

function StatItem({ label, value, icon, color }: StatItemProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                textAlign: "center",
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
                    borderColor: color,
                },
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: `${color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1,
                    color: color,
                }}
            >
                {icon}
            </Box>
            <Typography variant="h6" fontWeight={700} color="grey.900">
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {label}
            </Typography>
        </Paper>
    );
}

// Post Card Component
interface PostCardProps {
    post: {
        id: string;
        content: string;
        imageUrl?: string;
        reactCount: number;
        commentCount: number;
        createdDate: string;
        englishTip?: {
            word: string;
            meaning: string;
            example?: string;
        };
    };
}

function PostCard({ post }: PostCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                    transform: "translateX(4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    borderColor: theme.colors.primary,
                },
            }}
        >
            {/* Post Content */}
            <Typography
                variant="body1"
                color="grey.800"
                sx={{
                    mb: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}
            >
                {post.content}
            </Typography>

            {/* English Tip Badge */}
            {post.englishTip && (
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        mb: 2,
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <Sparkles size={14} color={theme.colors.primary} />
                        <Typography
                            variant="caption"
                            color={theme.colors.primaryDark}
                            fontWeight={600}
                        >
                            English Tip
                        </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} color="grey.900">
                        {post.englishTip.word}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {post.englishTip.meaning}
                    </Typography>
                </Box>
            )}

            {/* Post Meta */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Stack direction="row" spacing={2}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Heart size={14} color="#ef4444" />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {post.reactCount}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <MessageCircle size={14} color="#3b82f6" />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {post.commentCount}
                        </Typography>
                    </Stack>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    {formatDate(post.createdDate)}
                </Typography>
            </Stack>
        </Paper>
    );
}

// Loading Skeleton
function PostSkeleton() {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
            }}
        >
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
            <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={2}>
                    <Skeleton variant="text" width={40} />
                    <Skeleton variant="text" width={40} />
                </Stack>
            </Box>
        </Paper>
    );
}

// Main Component
export default function MyPostsTab() {
    const { data: myPostsResponse, isLoading: isLoadingPosts } = useGetMyPostsQuery({
        page: 1,
        limit: 10,
    });
    const { data: myStatsResponse, isLoading: isLoadingStats } = useGetMyStatsQuery();

    const posts = myPostsResponse?.data?.posts || [];
    const stats = myStatsResponse?.data;
    const pagination = myPostsResponse?.data?.pagination;

    return (
        <Box>
            {/* Stats Section */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <StatItem
                        label="Bài viết"
                        value={isLoadingStats ? "-" : stats?.totalPosts || 0}
                        icon={<FileText size={18} />}
                        color="#10b981"
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <StatItem
                        label="Lượt thích"
                        value={isLoadingStats ? "-" : stats?.totalReactions || 0}
                        icon={<Heart size={18} />}
                        color="#ef4444"
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <StatItem
                        label="Bình luận"
                        value={isLoadingStats ? "-" : stats?.totalComments || 0}
                        icon={<MessageCircle size={18} />}
                        color="#3b82f6"
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <StatItem
                        label="English Tips"
                        value={isLoadingStats ? "-" : stats?.postsWithVocab || 0}
                        icon={<BookOpen size={18} />}
                        color="#7c3aed"
                    />
                </Grid>
            </Grid>

            {/* Engagement Rate */}
            {stats?.engagementRate && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid #e5e7eb",
                        mb: 3,
                        bgcolor: "#fef3c7",
                        borderColor: "#fcd34d",
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TrendingUp size={18} color="#d97706" />
                        <Typography variant="body2" color="#92400e" fontWeight={600}>
                            Tỷ lệ tương tác: {stats.engagementRate} reactions/post
                        </Typography>
                    </Stack>
                </Paper>
            )}

            {/* Posts List */}
            <Typography variant="h6" fontWeight={700} color="grey.900" mb={2}>
                Bài viết của tôi
                {pagination && (
                    <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                        sx={{ ml: 1 }}
                    >
                        ({pagination.totalPosts} bài)
                    </Typography>
                )}
            </Typography>

            {isLoadingPosts ? (
                <Stack spacing={2}>
                    {[1, 2, 3].map((i) => (
                        <PostSkeleton key={i} />
                    ))}
                </Stack>
            ) : posts.length === 0 ? (
                <Box
                    sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 3,
                        border: "1px dashed #d1d5db",
                        bgcolor: "#f9fafb",
                    }}
                >
                    <FileText size={48} color="#9ca3af" />
                    <Typography variant="body1" color="text.secondary" mt={2}>
                        Bạn chưa có bài viết nào
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Hãy chia sẻ kiến thức tiếng Anh với cộng đồng!
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </Stack>
            )}

            {/* Load More */}
            {pagination?.hasMore && (
                <Box textAlign="center" mt={3}>
                    <Typography
                        variant="body2"
                        color={theme.colors.primary}
                        fontWeight={600}
                        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    >
                        Xem thêm bài viết...
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
