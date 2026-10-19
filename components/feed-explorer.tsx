"use client";

import { useMemo, useState } from "react";
import { submitVote } from "@/app/actions";
import { VoteButtons } from "@/components/vote-buttons";

export type FeedGeneration = {
  id: number;
  prompt: string;
  style: string;
  content: string;
  model: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
};

type Sort = "hot" | "new" | "top";
type Style = "all" | "deadpan" | "chaotic" | "wholesome";

const styleLabels: Record<string, string> = {
  deadpan: "Deadpan",
  chaotic: "Chaos",
  wholesome: "Wholesome",
};

function score(item: FeedGeneration) {
  return item.upvotes - item.downvotes;
}

function hotScore(item: FeedGeneration) {
  const ageInHours = Math.max(1, (Date.now() - new Date(item.created_at).getTime()) / 3_600_000);
  return score(item) / Math.pow(ageInHours + 2, 0.55);
}

export function FeedExplorer({
  generations,
  signedIn,
  votes,
}: {
  generations: FeedGeneration[];
  signedIn: boolean;
  votes: Record<number, number>;
}) {
  const [sort, setSort] = useState<Sort>("hot");
  const [style, setStyle] = useState<Style>("all");

  const visible = useMemo(() => {
    const filtered = style === "all" ? generations : generations.filter((item) => item.style === style);
    return [...filtered].sort((a, b) => {
      if (sort === "new") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "top") return score(b) - score(a) || b.upvotes - a.upvotes;
      return hotScore(b) - hotScore(a);
    });
  }, [generations, sort, style]);

  return (
    <section className="mt-14" aria-labelledby="feed-heading">
      <div className="feed-heading">
        <div>
          <p className="eyebrow text-coral">The city is talking</p>
          <h2 id="feed-heading" className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Today&apos;s punchlines
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-6 text-ink/55">One honest vote per person. The crowd does the editing.</p>
      </div>

      <div className="filter-bar" aria-label="Feed filters">
        <div className="filter-group" aria-label="Sort feed">
          {(["hot", "new", "top"] as Sort[]).map((item) => (
            <button key={item} onClick={() => setSort(item)} className={sort === item ? "filter-pill active" : "filter-pill"} aria-pressed={sort === item}>
              {item === "hot" ? "🔥 Hot" : item === "new" ? "✦ New" : "↑ Top"}
            </button>
          ))}
        </div>
        <div className="filter-group style-filters" aria-label="Filter by tone">
          {(["all", "deadpan", "chaotic", "wholesome"] as Style[]).map((item) => (
            <button key={item} onClick={() => setStyle(item)} className={style === item ? "filter-pill active" : "filter-pill"} aria-pressed={style === item}>
              {item === "all" ? "All tones" : styleLabels[item]}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty-card">
          <p className="text-xl font-black">Nothing in this lane yet.</p>
          <p className="mt-2 text-ink/55">Try another tone, or make the first one.</p>
        </div>
      ) : (
        <ol className="mt-7 grid gap-5 md:grid-cols-2">
          {visible.map((generation, index) => {
            const myVote = votes[generation.id];
            const netScore = score(generation);
            const total = generation.upvotes + generation.downvotes;
            return (
              <li id={`generation-${generation.id}`} key={generation.id} className="caption-card group">
                <div className="flex items-center justify-between gap-3">
                  <span className="style-chip">{styleLabels[generation.style] ?? generation.style}</span>
                  <span className="font-mono text-xs font-bold text-ink/40">#{String(index + 1).padStart(2, "0")}</span>
                </div>

                <blockquote className="mt-8 flex-1 text-[1.65rem] font-black leading-[1.14] tracking-[-0.035em] sm:text-3xl">
                  {generation.content}
                </blockquote>

                <details className="prompt-details mt-7">
                  <summary>Behind the punchline</summary>
                  <p className="mt-3 leading-6 text-ink/65">{generation.prompt}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-ink/35">Made with {generation.model}</p>
                </details>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-5">
                  <div className="mr-auto">
                    <p className="text-sm font-black">
                      <span className={netScore >= 0 ? "text-teal" : "text-coral"}>{netScore > 0 ? "+" : ""}{netScore}</span>
                      <span className="ml-1.5 text-ink/45">crowd score</span>
                    </p>
                    <p className="mt-0.5 text-xs text-ink/35">{total} {total === 1 ? "vote" : "votes"}</p>
                  </div>
                  {signedIn ? (
                    myVote ? (
                      <span className={`your-vote ${myVote === 1 ? "liked" : "skipped"}`}>
                        {myVote === 1 ? "You said it hits ↑" : "You passed ↓"}
                      </span>
                    ) : (
                      <form action={submitVote}><VoteButtons generationId={generation.id} /></form>
                    )
                  ) : (
                    <a href="#join" className="sign-in-nudge">Sign in to vote →</a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
