"use client";

import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    TextField,
    InputAdornment,
    Pagination,
    IconButton,
    Tooltip,
    TableFooter,
    TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import dayjs from "dayjs";

import { useGetAllTransactionsQuery } from "@/services/PaymentService";

// Mock data based on schema
// model transaction_history {
//   id, user_id, amount, created_date, order_code, status, paid_at, description
// }
const MOCK_TRANSACTIONS = [
    {
        id: "tx-001",
        user: { name: "Nguyễn Văn A", email: "nguyenvana@example.com" },
        amount: 500000,
        order_code: "ORD-20240101-001",
        status: "SUCCESS",
        created_date: "2024-01-01T10:00:00Z",
        paid_at: "2024-01-01T10:05:00Z",
        description: "Mua khóa học IELTS Basic",
    },
    {
        id: "tx-002",
        user: { name: "Trần Thị B", email: "tranthib@example.com" },
        amount: 1200000,
        order_code: "ORD-20240102-005",
        status: "PENDING",
        created_date: "2024-01-02T14:30:00Z",
        paid_at: null,
        description: "Nâng cấp gói Premium",
    },
    {
        id: "tx-003",
        user: { name: "Lê Văn C", email: "levanc@example.com" },
        amount: 250000,
        order_code: "ORD-20240103-012",
        status: "FAILED",
        created_date: "2024-01-03T09:15:00Z",
        paid_at: null,
        description: "Thanh toán lỗi mạng",
    },
    {
        id: "tx-004",
        user: { name: "Phạm Thị D", email: "phamthid@example.com" },
        amount: 800000,
        order_code: "ORD-20240104-008",
        status: "SUCCESS",
        created_date: "2024-01-04T16:20:00Z",
        paid_at: "2024-01-04T16:22:00Z",
        description: "Mua khóa học TOEIC 500+",
    },
    {
        id: "tx-005",
        user: { name: "Hoàng Văn E", email: "hoangvane@example.com" },
        amount: 0,
        order_code: "ORD-20240105-020",
        status: "CANCELLED",
        created_date: "2024-01-05T11:00:00Z",
        paid_at: null,
        description: "Hủy giao dịch",
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "SUCCESS":
            return "success";
        case "PENDING":
            return "warning";
        case "FAILED":
            return "error";
        case "CANCELLED":
            return "default";
        default:
            return "primary";
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export default function TransactionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const { data: response, isLoading, error } = useGetAllTransactionsQuery();

    const transactions = response?.Data || [];

    const filteredTransactions = transactions.filter((tx) =>
        tx.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.users?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ pb: 5 }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                }}
            >
                <Box>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            fontSize: "1.875rem",
                            background: "linear-gradient(to right, #2563eb, #9333ea, #db2777)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mb: 1,
                        }}
                    >
                        Lịch sử Giao dịch
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        Quản lý và theo dõi các giao dịch thanh toán trong hệ thống
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Tooltip title="Xuất báo cáo">
                        <IconButton
                            sx={{
                                bgcolor: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                "&:hover": { bgcolor: "#f8fafc" },
                            }}
                        >
                            <FileDownloadIcon sx={{ color: "#64748b" }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Stats Cards (Optional overview) */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                    gap: 3,
                    mb: 4,
                }}
            >
                {/* Placeholder for Stats components if needed later */}
            </Box>

            {/* Actions & Filters */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <TextField
                    placeholder="Tìm kiếm mã đơn, user..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        width: { xs: "100%", sm: 320 },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            bgcolor: "white",
                            "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                            "&:hover fieldset": { borderColor: "primary.main" },
                            "&.Mui-focused fieldset": {
                                borderColor: "primary.main",
                                borderWidth: "1px",
                            },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <IconButton
                    sx={{
                        border: "1px solid",
                        borderColor: "rgba(0,0,0,0.1)",
                        borderRadius: 2,
                        color: "text.secondary",
                    }}
                >
                    <FilterListIcon />
                </IconButton>
            </Paper>

            {/* Main Table */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                }}
            >
                <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: "#f8fafc" }}>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        fontSize: 13,
                                        py: 2,
                                    }}
                                >
                                    MÃ ĐƠN HÀNG
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        fontSize: 13,
                                        py: 2,
                                    }}
                                >
                                    NGƯỜI DÙNG
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        fontSize: 13,
                                        py: 2,
                                    }}
                                >
                                    SỐ TIỀN
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        fontSize: 13,
                                        py: 2,
                                    }}
                                >
                                    NỘI DUNG
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        fontSize: 13,
                                        py: 2,
                                    }}
                                >
                                    TRẠNG THÁI
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        fontSize: 13,
                                        py: 2,
                                    }}
                                >
                                    NGÀY TẠO
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        fontSize: 13,
                                        py: 2,
                                        width: 80,
                                    }}
                                >
                                    THAO TÁC
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <Typography color="error">Lỗi khi tải dữ liệu</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">Không có giao dịch nào</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions
                                    .slice((page - 1) * 10, page * 10)
                                    .map((row) => (
                                        <TableRow
                                            key={row.id}
                                            hover
                                            sx={{
                                                "&:last-child td, &:last-child th": { border: 0 },
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600, color: "primary.main" }}
                                                >
                                                    {row.order_code}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: "text.disabled", fontFamily: "monospace" }}
                                                >
                                                    {row.id.substring(0, 8)}...
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {row.users?.username || "Unknown"}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                        {row.users?.email || "-"}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {formatCurrency(Number(row.amount))}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        maxWidth: 200,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        color: "text.secondary",
                                                    }}
                                                >
                                                    {row.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    color={getStatusColor(row.status || "UNKNOWN") as any}
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: 11,
                                                        height: 24,
                                                        borderRadius: "6px",
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                    <Typography variant="body2" sx={{ fontSize: 13 }}>
                                                        {dayjs(row.created_date).format("DD/MM/YYYY")}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: "text.disabled", fontSize: 11 }}
                                                    >
                                                        {dayjs(row.created_date).format("HH:mm")}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            color: "text.secondary",
                                                            "&:hover": { color: "primary.main", bgcolor: "primary.50" },
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredTransactions.length}
                    page={page - 1}
                    onPageChange={(e, newPage) => setPage(newPage + 1)}
                    rowsPerPage={10}
                    onRowsPerPageChange={() => { }}
                    rowsPerPageOptions={[10]}
                />
            </Paper>
        </Box >
    );
}
