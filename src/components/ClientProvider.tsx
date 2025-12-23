"use client";
// src/components/ClientProvider.tsx
// ==================== CLIENT PROVIDER ====================

import { Provider } from "react-redux";
import store from "@/redux/store";
import LayoutAdmin from "@/components/Layout";
import ToastContainer from "@/components/ToastContainer";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedLayout from "@/components/ProtectedLayout";
import AuthProvider from "@/providers/AuthProvider";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = true;

  return (
    <Provider store={store}>
      {/* AuthProvider phải nằm trong Redux Provider để có thể dispatch actions */}
      <AuthProvider>
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          {isAdmin ? (
            <ProtectedLayout>
              <LayoutAdmin>
                <main>{children}</main>
              </LayoutAdmin>
            </ProtectedLayout>
          ) : (
            <main>{children}</main>
          )}
          <ToastContainer />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
