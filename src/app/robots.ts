import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://polyskill-ten.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/explore/projects",
          "/explore/students",
          "/explore/students/*",
          "/roadmaps",
          "/roadmaps/*",
        ],
        disallow: [
          "/dashboard",
          "/profile",
          "/skills",
          "/projects",
          "/projects/*",
          "/teams",
          "/teams/*",
          "/team-finder",
          "/invitations",
          "/messages",
          "/notifications",
          "/settings",
          "/admin",
          "/admin/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
