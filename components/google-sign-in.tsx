"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignIn() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-100 disabled:cursor-wait disabled:opacity-70"
      >
        <span className="grid size-6 place-items-center rounded-full bg-zinc-100 text-base font-black text-blue-600">
          G
        </span>
        {loading ? "Taking you to Google…" : "Continue with Google"}
      </button>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
