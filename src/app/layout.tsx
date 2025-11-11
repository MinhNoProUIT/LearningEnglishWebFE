import localFont from "next/font/local";
import "./globals.css";
import ClientProvider from "@/components/ClientProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { Inter } from "next/font/google";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"], // hỗ trợ cả tiếng Việt
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ClientProvider>{children}</ClientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
