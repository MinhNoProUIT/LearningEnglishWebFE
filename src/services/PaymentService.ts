// src/services/PaymentService.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";

const apiPath = "http://localhost:5000/api/payments";

interface CreatePaymentResponse {
    Success: boolean;
    Data: {
        checkoutUrl: string;
    };
    Message: string;
}

interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    created_date: string;
    order_code: string;
    status: string;
    paid_at: string | null;
    description: string | null;
    users?: User;
}

interface GetAllTransactionsResponse {
    Success: boolean;
    Data: Transaction[];
    Message: string;
}

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery: createBaseQuery(apiPath),
    endpoints: (builder) => ({
        createCoursePayment: builder.mutation<
            CreatePaymentResponse,
            { courseIds: string[]; paymentMethod: "vnpay" | "momo" }
        >({
            query: (body) => ({
                url: "/create-course-payment",
                method: "POST",
                body,
            }),
        }),
        getAllTransactions: builder.query<GetAllTransactionsResponse, void>({
            query: () => ({
                url: "/getAll",
                method: "GET",
            }),
        }),
    }),
});

export const { useCreateCoursePaymentMutation, useGetAllTransactionsQuery } = paymentApi;
