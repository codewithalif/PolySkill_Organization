import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? origin
      : forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  const errorDesc = searchParams.get("error_description");
  if (errorDesc) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(errorDesc)}`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_failed`);
}
