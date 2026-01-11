"use client";

import React, { useEffect } from "react";
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useDispatch } from "react-redux";
import { clearCart } from "@/redux/slices/cartSlice";
import Link from "next/link";

const PaymentSuccessPage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Clear cart when payment is successful
        dispatch(clearCart());
    }, [dispatch]);

    return (
        <Container maxWidth="sm" sx={{ py: 10 }}>
            <Paper
                elevation={6}
                sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: "32px",
                    background: "linear-gradient(to bottom, #ffffff, #f0fdf4)"
                }}
            >
                <CheckCircleOutlineIcon sx={{ fontSize: 100, color: "#22c55e", mb: 3 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom color="#166534">
                    Thanh toán thành công!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Cảm ơn bạn đã tin tưởng Evolingo. Khóa học của bạn đã được mở khóa và sẵn sàng để bắt đầu.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Button
                        component={Link}
                        href="/learn"
                        variant="contained"
                        size="large"
                        sx={{
                            borderRadius: "30px",
                            py: 1.5,
                            background: "linear-gradient(45deg, #22c55e, #16a34a)",
                            fontWeight: "bold"
                        }}
                    >
                        Bắt đầu học ngay ✍️
                    </Button>
                    <Button
                        component={Link}
                        href="/home"
                        variant="outlined"
                        size="large"
                        sx={{ borderRadius: "30px", py: 1.5 }}
                    >
                        Về trang chủ
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default PaymentSuccessPage;
