// src/middleware.ts
// ==================== NEXT.JS EDGE MIDDLEWARE ====================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ==================== CONSTANTS ====================
// Cookie name phải match với AUTH_COOKIE_NAME trong authSlice.ts
const AUTH_COOKIE_NAME = "auth_access_token";

// Routes yêu cầu authentication
const PROTECTED_ROUTES = [
  "/user/profile",
  "/user/achievements",
  "/user/exam",
  "/user/grammar",
  "/admin",
];

// Routes chỉ dành cho guests (chưa login)
const GUEST_ONLY_ROUTES = [
  "/authentication/login",
  "/authentication/register",
  "/authentication/forgot-password",
  "/authentication/reset-password",
];

// Routes admin only
const ADMIN_ROUTES = [
  "/admin",
];

// ==================== HELPER FUNCTIONS ====================
/**
 * Check if path matches any pattern in array
 * Supports wildcard patterns like "/admin/*"
 */
const matchesRoute = (pathname: string, routes: string[]): boolean => {
  return routes.some((route) => {
    // Exact match
    if (route === pathname) return true;

    // Wildcard match (e.g., "/admin/*" matches "/admin/users")
    if (route.endsWith("/*")) {
      const baseRoute = route.slice(0, -2);
      return pathname.startsWith(baseRoute);
    }

    // Prefix match for nested routes
    return pathname.startsWith(route + "/") || pathname === route;
  });
};

/**
 * Decode JWT để lấy payload (không verify signature)
 * Chỉ dùng để đọc thông tin, không dùng để xác thực
 */
const decodeJWT = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || typeof payload.exp !== "number") return true;

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
};

// ==================== MIDDLEWARE ====================
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root "/" to welcome page
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/authentication/welcome", request.url));
  }

  // Get access token from cookie
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Check if user is authenticated
  const isAuthenticated = accessToken && !isTokenExpired(accessToken);

  // ==================== PROTECTED ROUTES ====================
  // Nếu user vào protected route mà chưa login -> redirect về login
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/authentication/login", request.url);
      // Lưu redirect URL để sau khi login có thể quay lại
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin routes
    if (matchesRoute(pathname, ADMIN_ROUTES)) {
      const payload = decodeJWT(accessToken!);
      // Giả sử role = true là admin
      if (!payload || payload.role !== true) {
        // User không phải admin -> redirect về home
        return NextResponse.redirect(new URL("/home", request.url));
      }
    }
  }

  // ==================== GUEST ONLY ROUTES ====================
  // Nếu user đã login mà vào login/register -> redirect về home
  if (matchesRoute(pathname, GUEST_ONLY_ROUTES)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  // Cho phép request tiếp tục
  return NextResponse.next();
}

// ==================== MATCHER CONFIG ====================
// Chỉ apply middleware cho các routes cần thiết
// Loại bỏ static files, api routes, _next
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};
