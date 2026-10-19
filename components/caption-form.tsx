"use client";

import { useState } from "react";
import { generateCaption } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const starters = [
  "The subway doors closed right as…",
  "Someone at Butler just…",
  "My bodega order became…",
  "A tourist asked me if…",
];

export function CaptionForm() {
  const [prompt, setPrompt] = useState("");

  return (
    <form action={generateCaption} className="studio-form">
      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <label htmlFor="prompt" className="font-black text-ink">Set the scene</label>
          <span className="font-mono text-xs text-ink/40">{prompt.length}/280</span>
        </div>
        <textarea
          id="prompt"
          name="prompt"
          required
          minLength={3}
          maxLength={280}
          rows={6}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="The 1 train skipped my stop, so I accidentally had brunch in the Bronx…"
          className="studio-input"
        />
        <p className="mt-3 text-sm text-ink/45">Keep names and personal details out. Specific situations make better captions.</p>
      </div>

      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-ink/40">Need a spark?</p>
        <div className="flex flex-wrap gap-2">
          {starters.map((starter) => (
            <button key={starter} type="button" onClick={() => setPrompt(starter)} className="starter-chip">
              {starter}
            </button>
          ))}
        </div>
      </div>

      <fieldset>
        <legend className="mb-3 font-black text-ink">Pick a delivery</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["deadpan", "😐", "Deadpan", "Dry. Precise."],
            ["chaotic", "🌪️", "Chaos", "Group-chat energy."],
            ["wholesome", "☀️", "Wholesome", "Warm, still sharp."],
          ].map(([value, emoji, title, description], index) => (
            <label key={value} className="tone-option">
              <input type="radio" name="style" value={value} defaultChecked={index === 0} />
              <span className="tone-card">
                <span className="text-xl" aria-hidden>{emoji}</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6">
        <p className="text-sm text-ink/45">One scene in, one original caption out.</p>
        <SubmitButton>Make the punchline →</SubmitButton>
      </div>
    </form>
  );
}
