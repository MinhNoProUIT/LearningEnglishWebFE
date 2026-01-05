import { Box, Typography, Button, Chip, LinearProgress, IconButton } from "@mui/material";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { IGetAllCourses } from "@/models/Course";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { addToCart, selectCartItems } from "@/redux/slices/cartSlice";

interface CourseCardProps {
    course: IGetAllCourses;
    isOwned?: boolean;
}

const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
        case "beginner":
            return { bg: "linear-gradient(135deg, #4CAF50, #8BC34A)", text: "Cơ bản" };
        case "intermediate":
            return { bg: "linear-gradient(135deg, #FF9800, #FFC107)", text: "Trung bình" };
        case "advanced":
            return { bg: "linear-gradient(135deg, #f44336, #E91E63)", text: "Nâng cao" };
        default:
            return { bg: "linear-gradient(135deg, #9E9E9E, #BDBDBD)", text: level || "N/A" };
    }
};

const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return price.toLocaleString("vi-VN") + " VND";
};

const CourseCard = ({ course, isOwned = false }: CourseCardProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const difficulty = getDifficultyColor(course.difficulty_level);

    // Check if course is already in cart
    const isInCart = cartItems.some((item) => item.id === course.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isInCart) {
            dispatch(addToCart(course));
        }
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Add to cart then navigate to pay
        if (!isInCart) {
            dispatch(addToCart(course));
        }
        router.push("/pay");
    };

    const handleStartLearning = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Navigate to course learning page
        router.push(`/learn?courseId=${course.id}`);
    };

    return (
        <Box
            sx={{
                width: {
                    xs: "100%",
                    sm: "calc(50% - 12px)",
                    md: "calc(33.333% - 16px)",
                },
                borderRadius: "20px",
                overflow: "hidden",
                position: "relative",
                bgcolor: "white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
                    "& .hover-overlay": {
                        opacity: 1,
                    },
                },
            }}
        >
            {/* Difficulty Badge */}
            <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    background: difficulty.bg,
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    zIndex: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
            >
                {t(difficulty.text)}
            </Box>

            {/* Owned Badge */}
            {isOwned && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "linear-gradient(135deg, #00C853, #69F0AE)",
                        color: "white",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "20px",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        zIndex: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 14 }} />
                    {t("Đã sở hữu")}
                </Box>
            )}

            {/* Free Badge (only show if not owned) */}
            {!isOwned && course.price === 0 && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "linear-gradient(135deg, #00C853, #69F0AE)",
                        color: "white",
                        px: 2,
                        py: 0.5,
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        zIndex: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                >
                    {t("Miễn phí")}
                </Box>
            )}

            {/* Course Image */}
            <Box
                sx={{
                    width: "100%",
                    height: "180px",
                    position: "relative",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
            >
                {course.image_url ? (
                    <Image
                        src={course.image_url}
                        alt={course.title}
                        fill
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <MenuBookIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.5)" }} />
                    </Box>
                )}

                {/* Hover Overlay */}
                <Box
                    className="hover-overlay"
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1.5,
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                    }}
                >
                    {isOwned ? (
                        // Already owned - Show "Học ngay" button
                        <Button
                            onClick={handleStartLearning}
                            variant="contained"
                            startIcon={<PlayArrowIcon />}
                            sx={{
                                background: "linear-gradient(135deg, #00C853, #69F0AE)",
                                color: "white",
                                borderRadius: "25px",
                                px: 4,
                                py: 1.5,
                                fontWeight: "bold",
                                fontSize: "1rem",
                                boxShadow: "0 4px 15px rgba(0, 200, 83, 0.4)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #00a844, #5be09e)",
                                    transform: "scale(1.05)",
                                },
                            }}
                        >
                            {t("Học ngay")}
                        </Button>
                    ) : (
                        // Not owned - Show "Add to cart" icon and "Đăng ký ngay" button
                        <>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <IconButton
                                    onClick={handleAddToCart}
                                    sx={{
                                        bgcolor: isInCart ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
                                        color: isInCart ? "#69F0AE" : "white",
                                        width: 50,
                                        height: 50,
                                        "&:hover": {
                                            bgcolor: "rgba(255,255,255,0.4)",
                                            transform: "scale(1.1)",
                                        },
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {isInCart ? (
                                        <CheckCircleIcon sx={{ fontSize: 28 }} />
                                    ) : (
                                        <ShoppingCartOutlinedIcon sx={{ fontSize: 28 }} />
                                    )}
                                </IconButton>
                            </Box>
                            <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                                {isInCart ? t("Đã thêm vào giỏ") : t("Thêm vào giỏ hàng")}
                            </Typography>
                            <Button
                                onClick={handleBuyNow}
                                variant="contained"
                                sx={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    borderRadius: "25px",
                                    px: 4,
                                    py: 1,
                                    fontWeight: "bold",
                                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                                        transform: "scale(1.05)",
                                    },
                                }}
                            >
                                {t("Đăng ký ngay")}
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            {/* Course Content */}
            <Box sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                {/* Title */}
                <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                        mb: 1,
                        color: "#1a1a2e",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.3,
                        minHeight: "52px",
                    }}
                >
                    {course.title}
                </Typography>

                {/* Level tag */}
                {course.level && (
                    <Chip
                        label={course.level}
                        size="small"
                        sx={{
                            alignSelf: "flex-start",
                            mb: 1.5,
                            bgcolor: "rgba(103, 126, 234, 0.1)",
                            color: "#667eea",
                            fontWeight: 500,
                        }}
                    />
                )}

                {/* Stats Row */}
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                        mb: 2,
                        color: "text.secondary",
                        fontSize: "0.85rem",
                    }}
                >
                    {course.estimated_hours && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 18, color: "#667eea" }} />
                            <Typography variant="body2">{course.estimated_hours}h</Typography>
                        </Box>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PeopleAltIcon sx={{ fontSize: 18, color: "#667eea" }} />
                        <Typography variant="body2">
                            {course.enrollment_count.toLocaleString()} {t("học viên")}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <MenuBookIcon sx={{ fontSize: 18, color: "#667eea" }} />
                        <Typography variant="body2">{course.total_words} {t("từ")}</Typography>
                    </Box>
                </Box>

                {/* Completion Rate Progress */}
                {course.completion_rate !== undefined && course.completion_rate !== null && (
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                                <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                                {t("Tỷ lệ hoàn thành")}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                                {Number(course.completion_rate).toFixed(0)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Number(course.completion_rate)}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: "rgba(103, 126, 234, 0.1)",
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 3,
                                    background: "linear-gradient(90deg, #667eea, #764ba2)",
                                },
                            }}
                        />
                    </Box>
                )}

                {/* Spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Price (only show if not owned) */}
                {!isOwned && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            mt: "auto",
                            pt: 2,
                            borderTop: "1px solid rgba(0,0,0,0.05)",
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                                background: course.price === 0
                                    ? "linear-gradient(135deg, #00C853, #69F0AE)"
                                    : "linear-gradient(135deg, #667eea, #764ba2)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            {formatPrice(course.price)}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default CourseCard;
