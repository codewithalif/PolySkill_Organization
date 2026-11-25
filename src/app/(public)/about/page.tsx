import type { Metadata } from "next";
import { AboutContent } from "@/components/about/about-content";

export const metadata: Metadata = {
  title: "About Us – Empowering Polytechnic Students",
  description:
    "Learn about PolySkill's mission to bridge the tech skill gap for polytechnic diploma students across Bangladesh with collaborative project building and industry roadmaps.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About PolySkill – Empowering Polytechnic Students in Bangladesh",
    description:
      "Learn about PolySkill's mission to bridge the tech skill gap for polytechnic diploma students across Bangladesh with collaborative project building and industry roadmaps.",
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About PolySkill – Empowering Polytechnic Students in Bangladesh",
    description:
      "Learn about PolySkill's mission to bridge the tech skill gap for polytechnic diploma students across Bangladesh with collaborative project building and industry roadmaps.",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
