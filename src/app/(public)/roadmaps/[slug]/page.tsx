import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getRoadmapBySlugAction } from "@/actions/roadmaps";
import { RoadmapDetailClient } from "./roadmap-detail-client";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const res = await getRoadmapBySlugAction(slug);
  if (!res.success || !res.data) {
    return {
      title: "Roadmap Not Found",
      description: "The requested polytechnic skill roadmap was not found on PolySkill.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${res.data.title} – Polytechnic Skill Roadmap`;
  const description =
    res.data.description ||
    `Step-by-step ${res.data.title} curriculum and study guide tailored for polytechnic diploma students in Bangladesh.`;
  const canonicalUrl = `/roadmaps/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | PolySkill`,
      description,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: "/polyskill-logo.png",
          alt: `${res.data.title} Roadmap`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | PolySkill`,
      description,
      images: ["/polyskill-logo.png"],
    },
  };
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const res = await getRoadmapBySlugAction(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: res.data.title,
    description: res.data.description,
    provider: {
      "@type": "Organization",
      name: "PolySkill",
      sameAs: "https://polyskill-ten.vercel.app",
    },
    educationalLevel: res.data.difficulty || "Diploma in Engineering",
    url: `https://polyskill-ten.vercel.app/roadmaps/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <RoadmapDetailClient roadmap={res.data} />
    </>
  );
}
