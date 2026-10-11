import { redirect } from "next/navigation";
import { generateCaption } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";

const errorMessages: Record<string, string> = {
  prompt: "Give the generator a scenario between 3 and 280 characters.",
  style: "Choose one of the available styles.",
  configuration: "The AI generator is not configured yet.",
  provider: "Gemini could not generate a caption. Try again in a moment.",
  blocked: "That scenario did not produce a usable caption. Try a different angle.",
  save: "The caption was generated but could not be saved.",
};

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const [{ data: { user } }, params] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ]);
  if (!user) redirect("/");

  return (
    <main className="px-6 py-16 sm:py-24">
      <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_0.75fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-400">Members-only studio</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">Turn a city moment into a punchline.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Drop in something painfully specific from campus or your weekend in New York. Gemini writes one caption; the community decides whether it hits.
          </p>

          {params.error && (
            <p className="mt-7 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-red-200">
              {errorMessages[params.error] ?? "Something went wrong."}
            </p>
          )}

          <form action={generateCaption} className="mt-8 space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <label className="block">
              <span className="mb-2 block font-semibold text-white">What happened?</span>
              <textarea
                name="prompt"
                required
                minLength={3}
                maxLength={280}
                rows={6}
                placeholder="The 1 train skipped my stop, so I accidentally had brunch in the Bronx…"
                className="w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-400"
              />
              <span className="mt-2 block text-sm text-zinc-500">No personal information. Keep it under 280 characters.</span>
            </label>
            <label className="block">
              <span className="mb-2 block font-semibold text-white">Delivery</span>
              <select name="style" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-amber-400">
                <option value="deadpan">Deadpan</option>
                <option value="chaotic">Chaotic group chat</option>
                <option value="wholesome">Wholesome</option>
              </select>
            </label>
            <SubmitButton>Generate with Gemini →</SubmitButton>
          </form>
        </div>

        <aside className="h-fit rounded-3xl border border-amber-400/25 bg-amber-400/10 p-7 lg:mt-24">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Today&apos;s field guide</p>
          <ul className="mt-5 space-y-4 text-zinc-300">
            <li>🚇 A commute that became a side quest</li>
            <li>🥯 A food take that could end a friendship</li>
            <li>📚 Butler Library after midnight</li>
            <li>🗽 A tourist moment you will deny forever</li>
          </ul>
          <p className="mt-6 border-t border-amber-300/20 pt-5 text-sm leading-6 text-amber-100/70">
            Your scenario, the complete generation prompt, model name, and result are saved so every caption has a transparent origin.
          </p>
        </aside>
      </section>
    </main>
  );
}
