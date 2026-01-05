// src/redux/slices/cartSlice.ts
// ==================== CART STATE MANAGEMENT ====================

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IGetAllCourses } from "@/models/Course";

interface CartState {
    items: IGetAllCourses[];
}

// Load cart from localStorage
const loadCartFromStorage = (): IGetAllCourses[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem("cart");
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save cart to localStorage
const saveCartToStorage = (items: IGetAllCourses[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cart", JSON.stringify(items));
};

const initialState: CartState = {
    items: [],
};

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        // Initialize cart from localStorage (call on app mount)
        initializeCart: (state) => {
            state.items = loadCartFromStorage();
        },
        // Add course to cart
        addToCart: (state, action: PayloadAction<IGetAllCourses>) => {
            const exists = state.items.find((item) => item.id === action.payload.id);
            if (!exists) {
                state.items.push(action.payload);
                saveCartToStorage(state.items);
            }
        },
        // Remove course from cart
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            saveCartToStorage(state.items);
        },
        // Clear entire cart
        clearCart: (state) => {
            state.items = [];
            saveCartToStorage(state.items);
        },
    },
});

export const { initializeCart, addToCart, removeFromCart, clearCart } =
    cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
    state.cart.items.length;
export const selectCartTotal = (state: { cart: CartState }) =>
    state.cart.items.reduce((total, item) => total + item.price, 0);
export const isInCart = (state: { cart: CartState }, courseId: string) =>
    state.cart.items.some((item) => item.id === courseId);

export default cartSlice.reducer;
