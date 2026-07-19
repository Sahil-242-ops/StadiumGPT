import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "StadiumGPT — FIFA World Cup 2026 AI Assistant",
  description:
    "StadiumGPT — Your GenAI-powered assistant for FIFA World Cup 2026. Get real-time navigation, crowd guidance, accessibility help, and multilingual support.",
  openGraph: {
    title: "StadiumGPT — FIFA World Cup 2026",
    description:
      "GenAI-powered stadium assistant. Navigate, discover facilities, and get real-time crowd guidance.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
  width: "device-width",
  initialScale: 1,
};

import { AuthProvider } from "../store/authContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
