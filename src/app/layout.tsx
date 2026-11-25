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

const siteUrl = "https://polyskill-ten.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PolySkill – Learn Skills. Build Projects. Find Your Team.",
    template: "%s | PolySkill",
  },
  description:
    "PolySkill is the dedicated platform for polytechnic diploma students in Bangladesh to master tech skills, build verified portfolio projects, and connect with teammates.",
  keywords: [
    "PolySkill",
    "polytechnic students Bangladesh",
    "diploma engineering skills",
    "polytechnic project showcase",
    "diploma in engineering",
    "polytechnic computer technology",
    "student team finder",
    "tech learning roadmaps",
  ],
  authors: [{ name: "PolySkill Community" }],
  creator: "PolySkill",
  publisher: "PolySkill",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/polyskill-logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/polyskill-logo.png",
    apple: "/polyskill-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "PolySkill",
    title: "PolySkill – Learn Skills. Build Projects. Find Your Team.",
    description:
      "PolySkill is the dedicated platform for polytechnic diploma students in Bangladesh to master tech skills, build verified portfolio projects, and connect with teammates.",
    images: [
      {
        url: "/polyskill-logo.png",
        width: 512,
        height: 512,
        alt: "PolySkill Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PolySkill – Learn Skills. Build Projects. Find Your Team.",
    description:
      "PolySkill is the dedicated platform for polytechnic diploma students in Bangladesh to master tech skills, build verified portfolio projects, and connect with teammates.",
    images: ["/polyskill-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "PolySkill",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/polyskill-logo.png`,
        width: 512,
        height: 512,
      },
      description:
        "The dedicated skills development, project showcase, and collaboration platform for polytechnic diploma students in Bangladesh.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "PolySkill",
      alternateName: ["Poly Skill"],
      description: "Learn Skills. Build Projects. Find Your Team.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/explore/projects?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
      inLanguage: ["en", "bn"],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
