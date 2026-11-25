import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://polyskill-ten.vercel.app";
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

      // Fetch public students
      const { data: students } = await supabase
        .from("profiles")
        .select("username, updated_at, created_at")
        .not("username", "is", null)
        .limit(1000);

      if (students && students.length > 0) {
        studentRoutes = students
          .filter((student) => Boolean(student.username))
          .map((student) => ({
            url: `${baseUrl}/explore/students/${encodeURIComponent(student.username)}`,
            lastModified: student.updated_at ? new Date(student.updated_at) : now,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }));
      }

      // Fetch roadmaps
      const { data: roadmaps } = await supabase
        .from("roadmaps")
        .select("slug, created_at")
        .limit(100);

      if (roadmaps && roadmaps.length > 0) {
        roadmapRoutes = roadmaps
          .filter((roadmap) => Boolean(roadmap.slug))
          .map((roadmap) => ({
            url: `${baseUrl}/roadmaps/${encodeURIComponent(roadmap.slug)}`,
            lastModified: roadmap.created_at ? new Date(roadmap.created_at) : now,
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
