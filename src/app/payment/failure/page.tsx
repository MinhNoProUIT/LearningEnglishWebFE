"use client";

import React from "react";
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PaymentFailurePage = () => {
    const searchParams = useSearchParams();
    const errorCode = searchParams.get("code");
    const errorMessage = searchParams.get("error");

    return (
        <Container maxWidth="sm" sx={{ py: 10 }}>
            <Paper
                elevation={6}
                sx={{
                    p: 6,
                    textAlign: "center",
                    borderRadius: "32px",
                    background: "linear-gradient(to bottom, #ffffff, #fef2f2)"
                }}
            >
                <ErrorOutlineIcon sx={{ fontSize: 100, color: "#ef4444", mb: 3 }} />
                <Typography variant="h4" fontWeight="bold" gutterBottom color="#991b1b">
                    Thanh toán thất bại
                </Typography>

                <Box sx={{ bgcolor: "rgba(239, 68, 68, 0.05)", p: 2, borderRadius: "12px", mb: 4 }}>
                    <Typography variant="body1" color="#991b1b">
                        {errorMessage || "Có lỗi xảy ra trong quá trình xử lý thanh toán. Vui lòng thử lại sau."}
                    </Typography>
                    {errorCode && (
                        <Typography variant="caption" color="text.secondary">
                            Mã lỗi: {errorCode}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Button
                        component={Link}
                        href="/pay"
                        variant="contained"
                        size="large"
                        sx={{
                            borderRadius: "30px",
                            py: 1.5,
                            background: "linear-gradient(45deg, #ef4444, #dc2626)",
                            fontWeight: "bold"
                        }}
                    >
                        Thử lại 🔄
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

export default PaymentFailurePage;
