"use client";

import * as React from "react";
import { useState } from "react";
import {
    Box,
    IconButton,
    Badge,
    Popover,
    Typography,
    Button,
    Divider,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
    selectCartItems,
    selectCartCount,
    selectCartTotal,
    removeFromCart,
    clearCart,
} from "@/redux/slices/cartSlice";

const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return price.toLocaleString("vi-VN") + " VND";
};

export default function ShopMenu() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const router = useRouter();
    const cartItems = useSelector(selectCartItems);
    const cartCount = useSelector(selectCartCount);
    const cartTotal = useSelector(selectCartTotal);

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleRemoveItem = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const handleCheckout = () => {
        handleClose();
        router.push("/pay");
    };

    const handleClearCart = () => {
        dispatch(clearCart());
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton
                onClick={handleClick}
                sx={{
                    color: "var(--text-color)",
                    "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.1)",
                    },
                }}
            >
                <Badge
                    badgeContent={cartCount}
                    color="error"
                    sx={{
                        "& .MuiBadge-badge": {
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            fontWeight: "bold",
                        },
                    }}
                >
                    <ShoppingCartOutlinedIcon />
                </Badge>
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                PaperProps={{
                    sx: {
                        width: 380,
                        maxHeight: 500,
                        borderRadius: "16px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                    },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        {t("Giỏ hàng")} ({cartCount})
                    </Typography>
                </Box>

                {/* Cart Items */}
                <Box sx={{ maxHeight: 280, overflow: "auto" }}>
                    {cartItems.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <ShoppingCartOutlinedIcon
                                sx={{ fontSize: 48, color: "grey.400", mb: 1 }}
                            />
                            <Typography color="text.secondary">
                                {t("Giỏ hàng trống")}
                            </Typography>
                        </Box>
                    ) : (
                        cartItems.map((item) => (
                            <Box
                                key={item.id}
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    gap: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                    "&:hover": {
                                        bgcolor: "rgba(102, 126, 234, 0.05)",
                                    },
                                }}
                            >
                                {/* Course Info */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        fontWeight="600"
                                        sx={{
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#667eea",
                                            fontWeight: "bold",
                                            mt: 0.5,
                                        }}
                                    >
                                        {formatPrice(item.price)}
                                    </Typography>
                                </Box>

                                {/* Remove Button */}
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveItem(item.id)}
                                    sx={{
                                        color: "grey.500",
                                        "&:hover": {
                                            color: "error.main",
                                            bgcolor: "error.light",
                                        },
                                    }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))
                    )}
                </Box>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 2 }}>
                            {/* Total */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography fontWeight="600">{t("Tổng cộng")}:</Typography>
                                <Typography
                                    fontWeight="bold"
                                    sx={{
                                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontSize: "1.1rem",
                                    }}
                                >
                                    {formatPrice(cartTotal)}
                                </Typography>
                            </Box>

                            {/* Buttons */}
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleClearCart}
                                    sx={{
                                        borderColor: "grey.300",
                                        color: "grey.600",
                                        borderRadius: "10px",
                                        "&:hover": {
                                            borderColor: "error.main",
                                            color: "error.main",
                                        },
                                    }}
                                >
                                    {t("Xóa tất cả")}
                                </Button>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleCheckout}
                                    sx={{
                                        background:
                                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        borderRadius: "10px",
                                        fontWeight: "bold",
                                        "&:hover": {
                                            background:
                                                "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                                        },
                                    }}
                                >
                                    {t("Thanh toán")}
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
            </Popover>
        </>
    );
}
