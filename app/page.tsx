import { createClient } from "@/lib/supabase/server";

type Joke = { id: number; setup: string; punchline: string };

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();
  const { data: jokes, error } = await supabase
    .from("jokes")
    .select("id, setup, punchline")
    .order("id");

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <section className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
          Supabase joke collection
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          A little database humor
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          These jokes are fetched from the public jokes table in Supabase.
        </p>
        {error ? (
          <div className="mt-10 rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-200">
            <h2 className="font-semibold">Could not load the jokes</h2>
            <p className="mt-2 text-sm">{error.message}</p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {(jokes as Joke[]).map((joke) => (
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
