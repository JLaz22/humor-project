import Link from "next/link";
import { redirect } from "next/navigation";
import { CaptionForm } from "@/components/caption-form";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const errorMessages: Record<string, string> = {
  prompt: "Give the generator a scenario between 3 and 280 characters.",
  style: "Choose one of the available styles.",
  configuration: "The AI generator is not configured yet.",
  provider: "Gemini could not generate a caption. Try again in a moment.",
  blocked: "That scenario did not produce a usable caption. Try a different angle.",
  save: "The caption was generated but could not be saved.",
};

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const [{ data: { user } }, params] = await Promise.all([supabase.auth.getUser(), searchParams]);
  if (!user) redirect("/");

  return (
    <main className="min-h-[calc(100vh-80px)] bg-cream px-5 py-12 text-ink sm:px-8 sm:py-20">
      <section className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.7fr]">
        <div>
          <Link href="/" className="quiet-link text-ink/50">← Back to the feed</Link>
          <p className="eyebrow mt-10 text-coral">The caption studio</p>
          <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-7xl">Your moment.<br />AI&apos;s punchline.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/60">Tell us what happened. Add your own photo, let AI pick a matching one, or keep it caption only. Gemini brings the punchline; the crowd decides whether it hits.</p>
          {params.error && <p className="notice notice-error mt-7">{errorMessages[params.error] ?? "Something went wrong."}</p>}
          <div className="mt-9"><CaptionForm /></div>
        </div>
        <aside className="field-guide lg:sticky lg:top-28 lg:mt-28">
          <p className="eyebrow text-lime">Field notes</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight">Specific beats generic.</h2>
          <ul className="mt-7 space-y-5 text-cream/75">
            <li><span>🚇</span> A commute that became a side quest</li>
            <li><span>🥯</span> A food take that could end a friendship</li>
            <li><span>📚</span> Butler Library after midnight</li>
            <li><span>🗽</span> A tourist moment you will deny forever</li>
          </ul>
          <p className="mt-7 border-t border-cream/15 pt-6 text-sm leading-6 text-cream/45">Every result keeps its original scene and model credit attached. AI gets transparency; you get bragging rights.</p>
        </aside>
      </section>
    </main>
  );
}
