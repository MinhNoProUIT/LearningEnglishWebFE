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
    }),
});

export const { useCreateCoursePaymentMutation } = paymentApi;
