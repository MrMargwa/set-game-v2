import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Outfit } from "next/font/google";
import { SiteHeader } from "@/modules/accounts/presentation/site-header";
import { SiteFooter } from "@/shared/presentation/site-footer";
import { ThemeScript } from "@/shared/presentation/theme/theme-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4f0" },
    { media: "(prefers-color-scheme: dark)", color: "#121016" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "SET Game v2",
    template: "%s · SET Game v2",
  },
  description:
    "Speel SET in Classic of Time Attack, alleen of met anderen in een lobby.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} light min-h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex flex-col">
        <SiteHeader />
        <main className="flex flex-auto flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
