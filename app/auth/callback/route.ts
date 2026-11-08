import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: allowed } = await supabase.rpc("signup_email_allowed", { candidate: user?.email ?? "" });
      if (!allowed) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/?authError=not-allowed`);
      }
      return NextResponse.redirect(`${origin}/profile`);
    }
  }

  return NextResponse.redirect(`${origin}/?authError=callback`);
}
