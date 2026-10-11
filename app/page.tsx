import { createClient } from "@/lib/supabase/server";
import { GoogleSignIn } from "@/components/google-sign-in";
import Link from "next/link";

type Joke = { id: number; setup: string; punchline: string };

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string }>;
}) {
  const supabase = await createClient();
  const [{ data: { user } }, params] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ]);
  const { data: jokes, error } = await supabase
    .from("jokes")
    .select("id, setup, punchline")
    .order("id");

  return (
    <main className="px-6 py-16 sm:py-24">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
          Supabase joke collection
        </p>
        <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-7xl">
          Good jokes. <span className="text-amber-400">Properly normalized.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          These jokes are fetched from the public jokes table in Supabase.
        </p>
        <div className="mt-8">
          {user ? (
            <Link href="/members" className="inline-flex rounded-full bg-amber-400 px-6 py-3 font-bold text-zinc-950 transition hover:bg-amber-300">
              Enter the members room →
            </Link>
          ) : (
            <GoogleSignIn />
          )}
        </div>
        {params.authError && (
          <p className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
            Sign-in could not be completed. Please try again.
          </p>
        )}
        {error ? (
          <div className="mt-10 rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-200">
            <h2 className="font-semibold">Could not load the jokes</h2>
            <p className="mt-2 text-sm">{error.message}</p>
          </div>
        ) : (
          <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(jokes as Joke[] | null)?.map((joke) => (
              <li
                key={joke.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg"
              >
                <h2 className="text-xl font-semibold text-white">{joke.setup}</h2>
                <p className="mt-4 text-zinc-300">{joke.punchline}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
