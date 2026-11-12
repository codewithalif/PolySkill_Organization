import { notFound } from "next/navigation";
import { getHtmlLessonsWithProgressAction } from "@/actions/lessons";
import { HtmlPlaylistClient } from "./html-playlist-client";

export const instant = false;

export const metadata = {
  title: "Official HTML Curriculum | PolySkill Roadmaps",
  description: "Official 28-part HTML course with sequential unlocking for polytechnic students",
};

export default async function HtmlPlaylistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // This course specifically belongs to the web-development roadmap
  if (slug !== "web-development") {
    notFound();
  }

  const res = await getHtmlLessonsWithProgressAction();
  if (!res.success || !res.data) {
    return (
      <div className="container max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold">Failed to load playlist</h2>
        <p className="text-muted-foreground text-sm mt-2">
          {res.message || "Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <HtmlPlaylistClient
      initialLessons={res.data.lessons}
      playlistTitle={res.data.playlistTitle}
      playlistId={res.data.playlistId}
    />
  );
}
