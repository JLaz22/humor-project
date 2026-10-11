import Link from "next/link";
import { submitVote } from "@/app/actions";
import { GoogleSignIn } from "@/components/google-sign-in";
import { createClient } from "@/lib/supabase/server";

type Generation = {
  id: number;
  prompt: string;
  style: string;
  content: string;
  model: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
};

type Vote = { generation_id: number; value: number };

const voteErrors: Record<string, string> = {
  signin: "Sign in to rate a caption.",
  invalid: "That vote was not valid.",
  already: "You already rated that caption.",
  save: "Your rating could not be saved.",
};

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string; created?: string; voted?: string; voteError?: string }>;
}) {
  const supabase = await createClient();
  const [{ data: { user } }, params] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ]);

  const [{ data: generations, error }, { data: votes }] = await Promise.all([
    supabase
      .from("generations")
      .select("id, prompt, style, content, model, upvotes, downvotes, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    user
      ? supabase.from("votes").select("generation_id, value").eq("user_id", user.id)
      : Promise.resolve({ data: [] as Vote[] }),
  ]);

  const myVotes = new Map((votes as Vote[] | null)?.map((vote) => [vote.generation_id, vote.value]));

  return (
    <main className="px-6 py-14 sm:py-20">
      <section className="mx-auto max-w-5xl">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">The campus group chat, curated</p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              New York happened. <span className="text-amber-400">Gemini captioned it.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Fresh AI punchlines from Columbia students&apos; city moments. Vote on what hits and quietly bury what doesn&apos;t.
            </p>
          </div>
          <div className="lg:pb-2">
            {user ? (
              <Link href="/create" className="inline-flex rounded-full bg-amber-400 px-6 py-3 font-bold text-zinc-950 transition hover:bg-amber-300">
                Make a caption →
              </Link>
            ) : (
              <GoogleSignIn />
            )}
          </div>
        </div>

        {(params.authError || params.voteError || params.created || params.voted) && (
          <div className="mt-8">
            {params.authError && <p className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-200">Sign-in could not be completed.</p>}
            {params.voteError && <p className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-200">{voteErrors[params.voteError] ?? "Something went wrong."}</p>}
            {params.created && <p className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-emerald-200">Your caption is live. Let the group chat judge it.</p>}
            {params.voted && <p className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-emerald-200">Rating counted.</p>}
          </div>
        )}

        <div className="mt-14 flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Live feed</p>
            <h2 className="mt-1 text-2xl font-black">Newest city moments</h2>
          </div>
          <p className="text-sm text-zinc-500">One vote per person</p>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-200">The feed could not be loaded.</div>
        ) : !generations?.length ? (
          <div className="mt-8 rounded-3xl border border-dashed border-zinc-700 p-10 text-center">
            <p className="text-2xl font-black">The feed is suspiciously quiet.</p>
            <p className="mt-2 text-zinc-400">Sign in and give Gemini its first New York moment.</p>
          </div>
        ) : (
          <ol className="mt-8 space-y-6">
            {(generations as Generation[]).map((generation, index) => {
              const myVote = myVotes.get(generation.id);
              const score = generation.upvotes - generation.downvotes;
              return (
                <li id={`generation-${generation.id}`} key={generation.id} className="scroll-mt-24 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                    <span>#{String(index + 1).padStart(2, "0")} · {generation.style}</span>
                    <time dateTime={generation.created_at}>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(generation.created_at))}</time>
                  </div>
                  <blockquote className="mt-6 text-2xl font-black leading-snug text-white sm:text-3xl">“{generation.content}”</blockquote>
                  <details className="mt-5 text-sm text-zinc-500">
                    <summary className="cursor-pointer transition hover:text-zinc-300">See the human prompt</summary>
                    <p className="mt-2 border-l-2 border-zinc-700 pl-3">{generation.prompt}</p>
                    <p className="mt-2 text-xs">Generated with {generation.model}</p>
                  </details>
                  <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-5">
                    <div className="mr-auto flex items-center gap-3 text-sm font-bold">
                      <span className={score >= 0 ? "text-emerald-300" : "text-red-300"}>{score > 0 ? "+" : ""}{score} score</span>
                      <span className="text-zinc-600">{generation.upvotes + generation.downvotes} ratings</span>
                    </div>
                    {user ? (
                      myVote ? (
                        <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">You said {myVote === 1 ? "it hits 🔥" : "not it 🫠"}</span>
                      ) : (
                        <form action={submitVote} className="flex gap-2">
                          <input type="hidden" name="generationId" value={generation.id} />
                          <button name="value" value="1" className="rounded-full border border-emerald-700 px-4 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-950">Hits 🔥</button>
                          <button name="value" value="-1" className="rounded-full border border-red-900 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-950">Not it 🫠</button>
                        </form>
                      )
                    ) : (
                      <span className="text-sm text-zinc-500">Sign in to rate</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
