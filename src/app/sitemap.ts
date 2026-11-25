import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://polyskill-dip.vercel.app";
  const now = new Date();

  // Core public static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/explore/projects`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore/students`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/roadmaps`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/roadmaps/web-development/html`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Dynamic routes (Student public profiles & Roadmaps)
  let studentRoutes: MetadataRoute.Sitemap = [];
  let roadmapRoutes: MetadataRoute.Sitemap = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });

      // Fetch public students (only students with non-empty usernames; exclude admin/sub-admin)
      const { data: students } = await supabase
        .from("profiles")
        .select("username, updated_at, created_at")
        .eq("role", "student")
        .not("username", "is", null)
        .neq("username", "")
        .limit(1000);

      if (students && students.length > 0) {
        const seenUsernames = new Set<string>();
        studentRoutes = students
          .filter((student) => {
            if (!student.username || typeof student.username !== "string") return false;
            const clean = student.username.trim();
            if (!clean || seenUsernames.has(clean.toLowerCase())) return false;
            seenUsernames.add(clean.toLowerCase());
            return true;
          })
          .map((student) => ({
            url: `${baseUrl}/explore/students/${encodeURIComponent(student.username.trim())}`,
            lastModified: student.updated_at
              ? new Date(student.updated_at)
              : student.created_at
              ? new Date(student.created_at)
              : now,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }));
      }

      // Fetch published roadmaps
      const { data: roadmaps } = await supabase
        .from("roadmaps")
        .select("slug, updated_at, created_at")
        .not("slug", "is", null)
        .neq("slug", "")
        .limit(100);

      if (roadmaps && roadmaps.length > 0) {
        const seenSlugs = new Set<string>();
        roadmapRoutes = roadmaps
          .filter((roadmap) => {
            if (!roadmap.slug || typeof roadmap.slug !== "string") return false;
            const clean = roadmap.slug.trim();
            if (!clean || seenSlugs.has(clean.toLowerCase())) return false;
            seenSlugs.add(clean.toLowerCase());
            return true;
          })
          .map((roadmap) => ({
            url: `${baseUrl}/roadmaps/${encodeURIComponent(roadmap.slug.trim())}`,
            lastModified: roadmap.updated_at
              ? new Date(roadmap.updated_at)
              : roadmap.created_at
              ? new Date(roadmap.created_at)
              : now,
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }));
      }
    } catch (error) {
      console.error("Error generating dynamic sitemap entries:", error);
    }
  }

  return [...staticRoutes, ...roadmapRoutes, ...studentRoutes];
}
