import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().replace(/^@/, "");

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "PolySkill-App",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch user profile & repositories in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
        headers,
        next: { revalidate: 300 }, // 5 min cache
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=10`,
        {
          headers,
          next: { revalidate: 300 },
        }
      ),
    ]);

    if (userRes.status === 404) {
      return NextResponse.json(
        { error: "GitHub user not found" },
        { status: 404 }
      );
    }

    if (userRes.status === 403 || userRes.status === 429) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    if (!userRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub profile" },
        { status: userRes.status }
      );
    }

    const userData = await userRes.json();
    const reposData = reposRes.ok ? await reposRes.json() : [];

    const repos = Array.isArray(reposData)
      ? reposData.map((r: any) => ({
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          url: r.html_url,
          updatedAt: r.updated_at,
        }))
      : [];

    return NextResponse.json(
      {
        profile: {
          username: userData.login,
          avatarUrl: userData.avatar_url,
          bio: userData.bio,
          publicRepos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          htmlUrl: userData.html_url,
        },
        repos,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
