import Link from "next/link";
import { FeedExplorer, type FeedGeneration } from "@/components/feed-explorer";
import { GoogleSignIn } from "@/components/google-sign-in";
import { createClient } from "@/lib/supabase/server";

type Vote = { generation_id: number; value: number };

const voteErrors: Record<string, string> = {
  signin: "Sign in to rate a caption.",
  invalid: "That vote was not valid.",
  already: "You already rated that caption.",
  save: "Your rating could not be saved.",
};

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ authError?: string; created?: string; voted?: string; voteError?: string }> }) {
  const supabase = await createClient();
  const [{ data: { user } }, params] = await Promise.all([supabase.auth.getUser(), searchParams]);
  const [{ data: generations, error }, { data: votes }] = await Promise.all([
    supabase.from("generations").select("*").order("created_at", { ascending: false }).limit(50),
    user ? supabase.from("votes").select("generation_id, value").eq("user_id", user.id) : Promise.resolve({ data: [] as Vote[] }),
  ]);

  // Only send public display fields to the client, never owner IDs or the
  // internal generation prompt returned by the backwards-compatible query.
  const feed: FeedGeneration[] = (generations ?? []).map((item) => ({
    id: item.id, prompt: item.prompt, style: item.style, content: item.content,
    model: item.model, upvotes: item.upvotes, downvotes: item.downvotes,
    created_at: item.created_at, image_url: item.image_url, image_alt: item.image_alt,
    image_source: item.image_source, image_credit_url: item.image_credit_url,
  }));
  const myVotes = Object.fromEntries((votes as Vote[] | null)?.map((vote) => [vote.generation_id, vote.value]) ?? []);
  const totalVotes = feed.reduce((sum, item) => sum + item.upvotes + item.downvotes, 0);
  const topScore = feed.length ? Math.max(...feed.map((item) => item.upvotes - item.downvotes)) : 0;
  const today = new Date().toDateString();
  const madeToday = feed.filter((item) => new Date(item.created_at).toDateString() === today).length;

  return (
    <main>
      <section className="hero-shell">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.72fr] lg:py-28">
          <div>
            <div className="hero-kicker"><span className="live-dot" /> Live from New York</div>
            <h1 className="mt-7 max-w-4xl text-[3.6rem] font-black leading-[0.91] tracking-[-0.065em] text-cream sm:text-7xl lg:text-[5.7rem]">
              The city sets it up.<br /><span className="text-lime">AI lands the line.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-cream/65 sm:text-xl">
              Turn the oddly specific moments that happen around Columbia and NYC into AI captions. Then let the crowd decide what actually hits.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {user ? <Link href="/create" className="primary-cta">Make a punchline <span>→</span></Link> : <div id="join"><GoogleSignIn /></div>}
              <a href="#feed" className="quiet-link text-cream/65">See what&apos;s winning ↓</a>
            </div>
          </div>
          <div className="hero-card" aria-label="Example AI caption">
            <div className="flex items-center justify-between"><span className="hero-card-label">Featured energy</span><span className="text-xl" aria-hidden>🍎</span></div>
            <p className="mt-12 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">&ldquo;The MTA said character development, but I had a 9 a.m.&rdquo;</p>
            <div className="mt-10 flex items-center justify-between border-t border-ink/15 pt-5 text-sm font-bold"><span>DEADPAN</span><span className="text-teal">↑ Crowd approved</span></div>
          </div>
        </div>
      </section>

      <section className="bg-cream px-5 py-12 text-ink sm:px-8 sm:py-16" id="feed">
        <div className="mx-auto max-w-6xl">
          {(params.authError || params.voteError || params.created || params.voted) && (
            <div className={`notice ${params.authError || params.voteError ? "notice-error" : "notice-success"}`} role="status">
              {params.authError && "Sign-in could not be completed. Please try again."}
              {params.voteError && (voteErrors[params.voteError] ?? "Something went wrong.")}
              {params.created && "Your creation is live. Let the crowd judge it."}
              {params.voted && "Vote counted. The leaderboard just moved."}
            </div>
          )}
          <div className="stats-strip">
            <div><strong>{feed.length}</strong><span>punchlines live</span></div>
            <div><strong>{totalVotes}</strong><span>honest votes</span></div>
            <div><strong>{madeToday}</strong><span>made today</span></div>
            <div><strong>{topScore > 0 ? `+${topScore}` : topScore}</strong><span>top crowd score</span></div>
          </div>
          {error ? (
            <div className="empty-card mt-10 text-coral">The feed took a wrong train. Refresh and try again.</div>
          ) : !feed.length ? (
            <div className="empty-card mt-10 text-center"><p className="text-2xl font-black">The feed is suspiciously quiet.</p><p className="mt-2 text-ink/55">Sign in and give the city its first line.</p></div>
          ) : <FeedExplorer generations={feed} signedIn={Boolean(user)} votes={myVotes} />}
        </div>
      </section>

      <section className="bg-lime px-5 py-16 text-ink sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div><p className="eyebrow">Your turn</p><h2 className="mt-3 max-w-3xl text-4xl font-black leading-none tracking-[-0.05em] sm:text-6xl">Something weird happened today. Don&apos;t waste it.</h2></div>
          {user ? <Link href="/create" className="dark-cta">Open the studio →</Link> : <div id="join-bottom"><GoogleSignIn /></div>}
        </div>
      </section>
    </main>
  );
}
