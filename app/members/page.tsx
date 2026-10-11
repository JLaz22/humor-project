import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="px-6 py-24">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/15 via-zinc-900 to-zinc-950 p-8 sm:p-14">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400">Members-only clubhouse</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
          Welcome to the members room{profile?.first_name ? `, ${profile.first_name}` : ""}.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
          Your private launchpad for making the next caption the campus group chat can&apos;t stop quoting.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/create" className="inline-flex rounded-full bg-amber-400 px-5 py-3 font-bold text-zinc-950 transition hover:bg-amber-300">Make a caption →</Link>
          <Link href="/profile" className="inline-flex rounded-full border border-zinc-600 px-5 py-3 font-bold text-white transition hover:border-amber-400 hover:text-amber-300">Edit your profile</Link>
        </div>
      </section>
    </main>
  );
}
