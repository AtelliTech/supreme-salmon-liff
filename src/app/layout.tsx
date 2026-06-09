import { Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";
import type { Metadata, Viewport } from "next";

import AppLayout from "@/components/app-layout";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { LIFFProvider } from "@/providers/liff-providers";

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
          <LIFFProvider>
            <Providers>
              <AppLayout>{children}</AppLayout>
            </Providers>
          </LIFFProvider>
        </Suspense>
      </body>
    </html>
  );
}
