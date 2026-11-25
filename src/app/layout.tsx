import type { Metadata } from "next";
import { Space_Grotesk, Inter, Hind_Siliguri, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { AppProviders } from "@/providers/app-providers";
import { WelcomeSplash } from "@/components/shared/welcome-splash";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { CursorFollower } from "@/components/shared/cursor-follower";
import { ModernScrollExperience } from "@/components/shared/modern-scroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PolySkill – Learn Skills. Build Projects. Find Your Team.",
    template: "%s | PolySkill",
  },
  description:
    "One platform for polytechnic students to learn, collaborate, showcase projects, and grow together.",
  icons: {
    icon: [
      { url: "/polyskill-logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/polyskill-logo.png",
    apple: "/polyskill-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${hindSiliguri.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative" suppressHydrationWarning>
        <Script
          id="splash-check"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('polyskill_welcome_seen')){document.documentElement.classList.add('splash-dismissed')}}catch(e){}`,
          }}
        />
        <AppProviders>
          <AnimatedBackground />
          <CursorFollower />
          <ModernScrollExperience />
          <WelcomeSplash />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
