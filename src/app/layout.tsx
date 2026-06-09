import { Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";
import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import AppLayout from "@/components/app-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MOWI Taiwan",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body>
        <Suspense fallback={<div></div>}>
          <NuqsAdapter>
            <ThemeProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster richColors position="top-center" />
            </ThemeProvider>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  );
}
