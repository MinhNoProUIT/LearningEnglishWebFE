"use client";

import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Divider,
    IconButton,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    CircularProgress,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, selectCartTotal, removeFromCart } from "@/redux/slices/cartSlice";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WalletIcon from "@mui/icons-material/Wallet";
import { useCreateCoursePaymentMutation } from "@/services/PaymentService";
import { toast } from "react-hot-toast";

const PayPage = () => {
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "momo">("vnpay");
    const [createPayment, { isLoading }] = useCreateCoursePaymentMutation();

    const handleRemoveItem = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast.error("Giỏ hàng của bạn đang trống");
            return;
        }

        try {
            const courseIds = cartItems.map((item) => item.id);
            const response = await createPayment({ courseIds, paymentMethod }).unwrap();

            if (response.Success && response.Data.checkoutUrl) {
                window.location.href = response.Data.checkoutUrl;
            } else {
                toast.error(response.Message || "Có lỗi xảy ra khi tạo thanh toán");
            }
        } catch (err: any) {
            toast.error(err.data?.Message || "Lỗi kết nối máy chủ");
        }
    };

    if (cartItems.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Giỏ hàng của bạn đang trống 🛒
                </Typography>
                <Button
                    variant="contained"
                    href="/learn"
                    sx={{ mt: 3, borderRadius: "20px", px: 4 }}
                >
                    Khám phá các khóa học
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, textAlign: "center", color: "#1a1a2e" }}>
                Thanh toán khóa học 🚀
            </Typography>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
                {/* Cart Items List */}
                <Box sx={{ flex: 2 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid rgba(0,0,0,0.05)" }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Sản phẩm trong giỏ ({cartItems.length})
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        {cartItems.map((item) => (
                            <Box key={item.id} sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 60,
                                        borderRadius: "10px",
                                        bgcolor: "#667eea",
                                        backgroundImage: item.image_url ? `url(${item.image_url})` : "none",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center"
                                    }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography fontWeight="bold">{item.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">{item.level}</Typography>
                                </Box>
                                <Typography fontWeight="bold" color="primary">
                                    {item.price === 0 ? "Miễn phí" : item.price.toLocaleString("vi-VN") + " đ"}
                                </Typography>
                                <IconButton onClick={() => handleRemoveItem(item.id)} color="error">
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Paper>
                </Box>

                {/* Payment Summary & Method Selection */}
                <Box sx={{ flex: 1 }}>
                    <Paper elevation={4} sx={{ p: 4, borderRadius: "24px", position: "sticky", top: 100 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Tổng cộng
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography color="text.secondary">Tạm tính:</Typography>
                            <Typography fontWeight="bold">{cartTotal.toLocaleString("vi-VN")} đ</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold">Tổng tiền:</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                {cartTotal.toLocaleString("vi-VN")} đ
                            </Typography>
                        </Box>

                        <Typography fontWeight="bold" gutterBottom>
                            Phương thức thanh toán
                        </Typography>
                        <FormControl component="fieldset" fullWidth>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                            >
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        mb: 2,
                                        borderRadius: "12px",
                                        border: paymentMethod === "vnpay" ? "2px solid #667eea" : "1px solid #ddd",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <FormControlLabel
                                        value="vnpay"
                                        control={<Radio />}
                                        label={
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <AccountBalanceIcon color="primary" />
                                                <Typography fontWeight="bold">VNPay</Typography>
                                            </Box>
                                        }
                                        sx={{ width: "100%", m: 0, p: 1 }}
                                    />
                                </Paper>

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        mb: 4,
                                        borderRadius: "12px",
                                        border: paymentMethod === "momo" ? "2px solid #e11d48" : "1px solid #ddd",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <FormControlLabel
                                        value="momo"
                                        control={<Radio />}
                                        label={
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <WalletIcon sx={{ color: "#e11d48" }} />
                                                <Typography fontWeight="bold">MoMo Wallet</Typography>
                                            </Box>
                                        }
                                        sx={{ width: "100%", m: 0, p: 1 }}
                                    />
                                </Paper>
                            </RadioGroup>
                        </FormControl>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleCheckout}
                            disabled={isLoading}
                            sx={{
                                py: 2,
                                borderRadius: "30px",
                                fontWeight: "bold",
                                background: "linear-gradient(45deg, #667eea, #764ba2)",
                                fontSize: "1.1rem",
                                boxShadow: "0 8px 15px rgba(102, 126, 234, 0.4)",
                                "&:hover": { transform: "scale(1.02)" }
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Thanh toán ngay"}
                        </Button>
                        <Typography variant="caption" sx={{ mt: 2, display: "block", textAlign: "center", color: "text.secondary" }}>
                            Đảm bảo bảo mật và an toàn 🔒
                        </Typography>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
};

export default PayPage;
