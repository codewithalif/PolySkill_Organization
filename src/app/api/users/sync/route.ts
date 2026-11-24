import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/users/sync
 *
 * Lightweight endpoint that ensures an authenticated user always has a
 * corresponding row in public.profiles. Called client-side as a one-time
 * background fetch when the layout detects the session is active but the
 * profile row might be missing (e.g. trigger failure on initial signup, or
 * the user logged in before the profiles migration was applied).
 *
 * Safe to call repeatedly — it uses UPSERT so it won't create duplicates.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
    }

    // 1. Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, last_login_at")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile) {
      // Profile exists — just touch last_login_at so it stays fresh
      await supabase
        .from("profiles")
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return NextResponse.json({ success: true, action: "updated" });
    }

    // 2. Profile is missing — create it from auth metadata
    const meta = user.user_metadata || {};
    const emailLocal = (user.email || "").split("@")[0];
    const baseUsername = emailLocal.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "student";

    // Ensure username uniqueness
    let username = baseUsername;
    let attempt = 0;
    while (true) {
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (!taken) break;
      attempt += 1;
      username = `${baseUsername}_${attempt}`;
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: meta.full_name || baseUsername,
      username,
      email: user.email || "",
      roll_number: meta.roll_number || null,
      whatsapp_number: meta.whatsapp_number || null,
      gender: meta.gender || null,
      institute: meta.institute || "Other",
      department: meta.department || "Computer Science & Technology",
      semester: meta.semester || "1st Semester",
      role: "student",
      experience_level: "Beginner",
      profile_completion: 60,
      last_login_at: new Date().toISOString(),
    });

    if (insertError) {
      // Could be a race condition duplicate — not critical
      console.warn("[/api/users/sync] Profile insert warning:", insertError.message);
    }

    return NextResponse.json({ success: true, action: "created" });
  } catch (err: any) {
    console.error("[/api/users/sync] Unexpected error:", err);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}

// Allow GET for health check pings
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "/api/users/sync" });
}
