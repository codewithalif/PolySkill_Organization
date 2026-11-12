import { notFound } from "next/navigation";
import { getRoadmapBySlugAction } from "@/actions/roadmaps";
import { RoadmapDetailClient } from "./roadmap-detail-client";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getRoadmapBySlugAction(slug);
  if (!res.success || !res.data) {
    return { title: "Roadmap Not Found | PolySkill" };
  }
  return {
    title: `${res.data.title} | PolySkill Roadmap`,
    description: res.data.description,
  };
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getRoadmapBySlugAction(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  return <RoadmapDetailClient roadmap={res.data} />;
}
