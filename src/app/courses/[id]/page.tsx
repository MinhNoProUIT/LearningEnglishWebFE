"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Button,
    Chip,
    LinearProgress,
    Rating,
    Avatar,
    Skeleton,
    Alert,
    Tab,
    Tabs,
    Paper,
    TextField,
    Snackbar,
} from "@mui/material";
import {
    ArrowBack,
    AccessTime,
    PeopleAlt,
    MenuBook,
    TrendingUp,
    Star,
    PlayArrow,
    ShoppingCart,
    CheckCircle,
    Verified,
    ThumbUp,
    FormatQuote,
    Send,
} from "@mui/icons-material";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useGetCourseByIdQuery } from "@/services/CourseService";
import { useGetMyOwnedCoursesQuery } from "@/services/UserCourseService";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectCartItems } from "@/redux/slices/cartSlice";

// ==================== MOCK REVIEWS DATA ====================
const MOCK_REVIEWS = [
    {
        id: 1,
        userName: "Nguyễn Văn Minh",
        userAvatar: "https://i.pravatar.cc/150?img=1",
        rating: 5,
        date: "2 tuần trước",
        content: "Khóa học tuyệt vời! Nội dung rất chi tiết và dễ hiểu. Giảng viên giải thích rõ ràng, có nhiều ví dụ thực tế. Sau 3 tháng học, điểm TOEIC của tôi tăng từ 550 lên 785!",
        helpful: 45,
        verified: true,
    },
    {
        id: 2,
        userName: "Trần Thị Hương",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        rating: 5,
        date: "1 tháng trước",
        content: "Đây là khóa học tiếng Anh hay nhất mà tôi từng tham gia. Cách tổ chức bài học logic, từ cơ bản đến nâng cao.",
        helpful: 32,
        verified: true,
    },
    {
        id: 3,
        userName: "Lê Hoàng Nam",
        userAvatar: "https://i.pravatar.cc/150?img=3",
        rating: 4,
        date: "3 tuần trước",
        content: "Khóa học chất lượng, đáng đồng tiền. Tuy nhiên tôi mong có thêm phần luyện nói thực hành.",
        helpful: 28,
        verified: true,
    },
    {
        id: 4,
        userName: "Phạm Thùy Linh",
        userAvatar: "https://i.pravatar.cc/150?img=9",
        rating: 5,
        date: "2 tháng trước",
        content: "Xuất sắc! Tôi đã thử nhiều ứng dụng học tiếng Anh khác nhưng đây là cái tốt nhất.",
        helpful: 56,
        verified: true,
    },
    {
        id: 5,
        userName: "Đỗ Văn Khoa",
        userAvatar: "https://i.pravatar.cc/150?img=8",
        rating: 4,
        date: "1 tuần trước",
        content: "Khóa học rất bổ ích cho người mới bắt đầu. Flashcard và game học từ rất thú vị.",
        helpful: 19,
        verified: false,
    },
];

// ==================== HELPER FUNCTIONS ====================
const getDifficultyInfo = (level?: string) => {
    switch (level?.toLowerCase()) {
        case "beginner":
            return { bg: "#4CAF50", text: "Cơ bản" };
        case "intermediate":
            return { bg: "#FF9800", text: "Trung bình" };
        case "advanced":
            return { bg: "#f44336", text: "Nâng cao" };
        default:
            return { bg: "#9E9E9E", text: level || "N/A" };
    }
};

const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return price.toLocaleString("vi-VN") + " VND";
};

// ==================== COMPONENTS ====================
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

// Review Card Component
interface ReviewCardProps {
    review: typeof MOCK_REVIEWS[0];
}

function ReviewCard({ review }: ReviewCardProps) {
    const [liked, setLiked] = useState(false);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                mb: 2,
                bgcolor: "#fff",
                transition: "all 0.2s ease",
                "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
            }}
        >
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Avatar src={review.userAvatar} sx={{ width: 44, height: 44 }} />
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="body1" fontWeight={600}>
                            {review.userName}
                        </Typography>
                        {review.verified && (
                            <Chip
                                icon={<Verified sx={{ fontSize: 12 }} />}
                                label="Đã mua"
                                size="small"
                                sx={{
                                    height: 20,
                                    bgcolor: "#dcfce7",
                                    color: "#16a34a",
                                    fontSize: 11,
                                    "& .MuiChip-icon": { color: "#16a34a" },
                                }}
                            />
                        )}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Rating value={review.rating} readOnly size="small" sx={{ color: "#facc15" }} />
                        <Typography variant="caption" color="text.secondary">
                            {review.date}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                "{review.content}"
            </Typography>

            <Button
                size="small"
                startIcon={<ThumbUp sx={{ fontSize: 14 }} />}
                onClick={() => setLiked(!liked)}
                sx={{
                    textTransform: "none",
                    color: liked ? "#667eea" : "#94a3b8",
                    fontSize: 13,
                }}
            >
                Hữu ích ({liked ? review.helpful + 1 : review.helpful})
            </Button>
        </Paper>
    );
}

// Rating Summary Component
function RatingSummary({ averageRating, totalReviews }: { averageRating: number; totalReviews: number }) {
    const distribution = [
        { star: 5, count: 3, percent: 60 },
        { star: 4, count: 2, percent: 40 },
        { star: 3, count: 0, percent: 0 },
        { star: 2, count: 0, percent: 0 },
        { star: 1, count: 0, percent: 0 },
    ];

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", mb: 3 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 4, alignItems: "center" }}>
                <Box sx={{ textAlign: "center", minWidth: 140 }}>
                    <Typography variant="h2" fontWeight={700} sx={{ color: "#667eea" }}>
                        {averageRating.toFixed(1)}
                    </Typography>
                    <Rating value={averageRating} readOnly precision={0.1} sx={{ color: "#facc15", mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                        {totalReviews} đánh giá
                    </Typography>
                </Box>

                <Box sx={{ flex: 1, width: "100%" }}>
                    {distribution.map(({ star, count, percent }) => (
                        <Box key={star} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.8 }}>
                            <Typography variant="body2" sx={{ minWidth: 20, fontWeight: 500 }}>{star}</Typography>
                            <Star sx={{ fontSize: 16, color: "#facc15" }} />
                            <LinearProgress
                                variant="determinate"
                                value={percent}
                                sx={{
                                    flex: 1,
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: "#e2e8f0",
                                    "& .MuiLinearProgress-bar": {
                                        borderRadius: 4,
                                        bgcolor: "#667eea",
                                    },
                                }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24 }}>
                                {count}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}

// Add Review Form Component
function AddReviewForm({ onSubmit }: { onSubmit: (rating: number, content: string) => void }) {
    const [rating, setRating] = useState<number | null>(0);
    const [content, setContent] = useState("");

    const handleSubmit = () => {
        if (rating && content.trim()) {
            onSubmit(rating, content);
            setRating(0);
            setContent("");
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "2px dashed #667eea", bgcolor: "#f8fafc", mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: "#1e293b", mb: 2 }}>
                ✍️ Viết đánh giá của bạn
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Đánh giá của bạn:
                </Typography>
                <Rating
                    value={rating}
                    onChange={(_, value) => setRating(value)}
                    size="large"
                    sx={{
                        "& .MuiRating-iconFilled": { color: "#facc15" },
                        "& .MuiRating-iconHover": { color: "#fbbf24" },
                    }}
                />
            </Box>

            <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Chia sẻ trải nghiệm học tập của bạn với khóa học này..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "#fff",
                    },
                }}
            />

            <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handleSubmit}
                disabled={!rating || !content.trim()}
                sx={{
                    bgcolor: "#667eea",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    "&:hover": { bgcolor: "#5a67d8" },
                }}
            >
                Gửi đánh giá
            </Button>
        </Paper>
    );
}

// ==================== MAIN COMPONENT ====================
export default function CourseDetailPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;
    const dispatch = useDispatch();

    const [tabValue, setTabValue] = useState(0);
    const [reviews, setReviews] = useState(MOCK_REVIEWS);
    const [snackOpen, setSnackOpen] = useState(false);

    // API Hooks
    const { data: courseResponse, isLoading, error } = useGetCourseByIdQuery(courseId);
    const { data: ownedCourses = [] } = useGetMyOwnedCoursesQuery();
    const cartItems = useSelector(selectCartItems);

    // Extract course data
    const course = (courseResponse as any)?.Data || (courseResponse as any)?.data || courseResponse;
    const isOwned = ownedCourses.some((c) => c.id === courseId);
    const isInCart = cartItems.some((item) => item.id === courseId);
    const difficulty = getDifficultyInfo(course?.difficulty_level);

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const handleAddToCart = () => {
        if (!isInCart && course) {
            dispatch(addToCart(course));
        }
    };

    const handleBuyNow = () => {
        if (!isInCart && course) {
            dispatch(addToCart(course));
        }
        router.push("/pay");
    };

    const handleStartLearning = () => {
        router.push(`/learn?courseId=${courseId}`);
    };

    const handleAddReview = (rating: number, content: string) => {
        const newReview = {
            id: reviews.length + 1,
            userName: "Bạn",
            userAvatar: "https://i.pravatar.cc/150?img=12",
            rating,
            date: "Vừa xong",
            content,
            helpful: 0,
            verified: true,
        };
        setReviews([newReview, ...reviews]);
        setSnackOpen(true);
    };

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ maxWidth: 1000, mx: "auto", px: 3, py: 4 }}>
                <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4, mb: 3 }} />
                <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
            </Box>
        );
    }

    // Error state
    if (error || !course) {
        return (
            <Box sx={{ maxWidth: 1000, mx: "auto", px: 3, py: 4, textAlign: "center" }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {t("Không tìm thấy khóa học. Vui lòng thử lại.")}
                </Alert>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.back()}>
                    {t("Quay lại")}
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: "#f1f5f9", minHeight: "100vh", py: 4 }}>
            <Box sx={{ maxWidth: 1000, mx: "auto", px: 3 }}>
                {/* Hero Section */}
                <Paper
                    elevation={0}
                    sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: 4,
                        p: 3,
                        mb: 3,
                        overflow: "hidden",
                    }}
                >
                    {/* Back Button */}
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => router.back()}
                        sx={{ color: "white", textTransform: "none", mb: 2 }}
                    >
                        Quay lại
                    </Button>

                    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, alignItems: "flex-start" }}>
                        {/* Image */}
                        <Box
                            sx={{
                                width: { xs: "100%", md: 280 },
                                height: { xs: 160, md: 180 },
                                borderRadius: 3,
                                overflow: "hidden",
                                position: "relative",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                                flexShrink: 0,
                            }}
                        >
                            {course.image_url ? (
                                <Image src={course.image_url} alt={course.title} fill style={{ objectFit: "cover" }} />
                            ) : (
                                <Box sx={{ width: "100%", height: "100%", bgcolor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MenuBook sx={{ fontSize: 60, color: "rgba(255,255,255,0.5)" }} />
                                </Box>
                            )}
                        </Box>

                        {/* Info */}
                        <Box sx={{ flex: 1, color: "white" }}>
                            <Chip
                                label={difficulty.text}
                                size="small"
                                sx={{ bgcolor: difficulty.bg, color: "white", fontWeight: 600, mb: 1.5 }}
                            />

                            <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5, lineHeight: 1.3 }}>
                                {course.title || "Khóa học"}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                                <Typography variant="body1" fontWeight={600}>{averageRating.toFixed(1)}</Typography>
                                <Rating value={averageRating} readOnly size="small" sx={{ color: "#facc15" }} />
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>({reviews.length} đánh giá)</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>• {course.enrollment_count || 0} học viên</Typography>
                            </Box>

                            <Box sx={{ display: "flex", gap: 2.5, mb: 2, flexWrap: "wrap", opacity: 0.9 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <AccessTime sx={{ fontSize: 16 }} />
                                    <Typography variant="body2">{course.estimated_hours || 0}h học</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <MenuBook sx={{ fontSize: 16 }} />
                                    <Typography variant="body2">{course.total_words || 0} từ vựng</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <TrendingUp sx={{ fontSize: 16 }} />
                                    <Typography variant="body2">Hoàn thành: {Number(course.completion_rate || 0).toFixed(0)}%</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                {!isOwned && (
                                    <Typography variant="h6" fontWeight={700}>
                                        {formatPrice(course.price || 0)}
                                    </Typography>
                                )}

                                {isOwned ? (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PlayArrow />}
                                        onClick={handleStartLearning}
                                        sx={{
                                            bgcolor: "white",
                                            color: "#667eea",
                                            fontWeight: 600,
                                            px: 2.5,
                                            borderRadius: 2,
                                            "&:hover": { bgcolor: "#f8fafc" },
                                        }}
                                    >
                                        Bắt đầu học
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleBuyNow}
                                            sx={{
                                                bgcolor: "white",
                                                color: "#667eea",
                                                fontWeight: 600,
                                                px: 2.5,
                                                borderRadius: 2,
                                                "&:hover": { bgcolor: "#f8fafc" },
                                            }}
                                        >
                                            Đăng ký ngay
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={isInCart ? <CheckCircle /> : <ShoppingCart />}
                                            onClick={handleAddToCart}
                                            disabled={isInCart}
                                            sx={{
                                                borderColor: "white",
                                                color: "white",
                                                fontWeight: 500,
                                                px: 2,
                                                borderRadius: 2,
                                            }}
                                        >
                                            {isInCart ? "Đã thêm" : "Thêm vào giỏ"}
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* Content */}
                <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <Box sx={{ borderBottom: 1, borderColor: "#e2e8f0" }}>
                        <Tabs
                            value={tabValue}
                            onChange={(_, v) => setTabValue(v)}
                            sx={{
                                px: 2,
                                "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 15 },
                                "& .Mui-selected": { color: "#667eea !important" },
                                "& .MuiTabs-indicator": { bgcolor: "#667eea", height: 3 },
                            }}
                        >
                            <Tab label="Giới thiệu" />
                            <Tab label={`Đánh giá (${reviews.length})`} />
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        {/* Introduction Tab */}
                        <TabPanel value={tabValue} index={0}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                Mô tả khóa học
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
                                {course.description || "Khóa học tiếng Anh chất lượng cao, giúp bạn nâng cao kỹ năng ngôn ngữ một cách hiệu quả."}
                            </Typography>

                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                Bạn sẽ học được gì?
                            </Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
                                {[
                                    `Nắm vững ${course.total_words || 500}+ từ vựng thiết yếu`,
                                    "Cải thiện kỹ năng phát âm và nghe hiểu",
                                    "Áp dụng ngữ pháp vào giao tiếp thực tế",
                                    "Tự tin giao tiếp trong môi trường quốc tế",
                                    "Sẵn sàng cho các kỳ thi TOEIC, IELTS",
                                    "Phương pháp học từ vựng theo ngữ cảnh",
                                ].map((item, idx) => (
                                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <CheckCircle sx={{ fontSize: 18, color: "#10b981" }} />
                                        <Typography variant="body2" color="text.secondary">{item}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </TabPanel>

                        {/* Reviews Tab */}
                        <TabPanel value={tabValue} index={1}>
                            <RatingSummary averageRating={averageRating} totalReviews={reviews.length} />

                            <AddReviewForm onSubmit={handleAddReview} />

                            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                Đánh giá từ học viên
                            </Typography>
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </TabPanel>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={snackOpen}
                autoHideDuration={3000}
                onClose={() => setSnackOpen(false)}
                message="✅ Đánh giá của bạn đã được gửi!"
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </Box>
    );
}
