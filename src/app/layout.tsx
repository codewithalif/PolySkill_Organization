import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { WelcomeSplash } from "@/components/shared/welcome-splash";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { CursorFollower } from "@/components/shared/cursor-follower";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PolySkill – Learn Skills. Build Projects. Find Your Team.",
    template: "%s | PolySkill",
  },
  description:
    "One platform for polytechnic students to learn, collaborate, showcase projects, and grow together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative" suppressHydrationWarning>
        <AppProviders>
          <AnimatedBackground />
          <CursorFollower />
          <WelcomeSplash />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
