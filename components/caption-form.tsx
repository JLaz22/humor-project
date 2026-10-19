"use client";

import { useActionState, useEffect, useState } from "react";
import { generateCaption } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { MAX_MEME_PHOTO_BYTES, MEME_PHOTO_TYPES } from "@/lib/meme-upload";

const starters = [
  "The subway doors closed right as…",
  "Someone at Butler just…",
  "My bodega order became…",
  "A tourist asked me if…",
];

export function CaptionForm() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("deadpan");
  const [imageMode, setImageMode] = useState("none");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [state, formAction, pending] = useActionState(async (previous: { error?: string }, data: FormData) => {
    // Keep the selected file available for retry even when React resets the
    // native file input after a completed action.
    if (imageMode === "upload" && photo) data.set("photo", photo);
    return generateCaption(previous, data);
  }, {});

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  return (
    <form action={formAction} className="studio-form" aria-busy={pending}>
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
          disabled={pending}
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
            <button key={starter} type="button" disabled={pending} onClick={() => setPrompt(starter)} className="starter-chip">
              {starter}
            </button>
          ))}
        </div>
      </div>

      <fieldset disabled={pending}>
        <legend className="mb-3 font-black text-ink">Pick a delivery</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["deadpan", "😐", "Deadpan", "Dry. Precise."],
            ["chaotic", "🌪️", "Chaos", "Group-chat energy."],
            ["wholesome", "☀️", "Wholesome", "Warm, still sharp."],
          ].map(([value, emoji, title, description]) => (
            <label key={value} className="tone-option">
              <input type="radio" name="style" value={value} checked={style === value} onChange={() => setStyle(value)} />
              <span className="tone-card">
                <span className="text-xl" aria-hidden>{emoji}</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={pending}>
        <legend className="mb-3 font-black text-ink">Make it a meme</legend>
        <p className="mb-4 text-sm leading-6 text-ink/50">Bring your own photo or let AI find a visual that fits your punchline.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["none", "Aa", "Caption only", "Let the words do it."],
            ["upload", "↥", "My photo", "Build on your moment."],
            ["ai-pick", "✦", "AI pick", "A fitting photo, picked for you."],
          ].map(([value, icon, title, description]) => (
            <label key={value} className="tone-option">
              <input type="radio" name="imageMode" value={value} checked={imageMode === value} onChange={() => setImageMode(value)} />
              <span className="tone-card">
                <span className="text-xl" aria-hidden>{icon}</span>
                <strong>{title}</strong><small>{description}</small>
              </span>
            </label>
          ))}
        </div>
        {imageMode === "ai-pick" && (
          <div className="photo-explainer mt-5">
            <span aria-hidden>✦</span>
            <p>AI matches your caption&apos;s subject and mood to our photo library, then picks from the best fits for a little variety. If nothing fits, we&apos;ll ask you to try another option.</p>
          </div>
        )}
        <div hidden={imageMode !== "upload"} className="mt-5">
          <label htmlFor="meme-photo" className="mb-2 block text-sm font-bold">Choose your photo</label>
          <input
            id="meme-photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={imageMode !== "upload" || pending}
            required={imageMode === "upload" && !photo}
            aria-describedby="photo-help photo-error"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              const error = selected && !MEME_PHOTO_TYPES.includes(selected.type)
                ? "Please choose a JPG, PNG, or WebP photo."
                : selected && selected.size > MAX_MEME_PHOTO_BYTES ? "Choose a photo smaller than 3 MB." : "";
              setPhotoError(error);
              setPhoto(error ? null : selected ?? null);
              setPreview(!error && selected ? URL.createObjectURL(selected) : null);
              if (error) event.target.value = "";
            }}
            className="photo-file-input"
          />
          {photo && <p className="mt-2 break-all text-xs font-bold text-teal">Selected: {photo.name}</p>}
          <p id="photo-help" className="mt-3 text-xs leading-5 text-ink/50">JPG, PNG, or WebP · Up to 3 MB. AI uses your photo to write the caption. Publishing makes the photo public—use one you have permission to share.</p>
          <p id="photo-error" className="mt-2 text-sm text-coral" role="alert">{photoError}</p>
          {preview && (
            <figure className="photo-preview mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Your selected meme photo" />
              <figcaption>Your photo + an AI punchline. The finished meme will appear in the feed.</figcaption>
            </figure>
          )}
        </div>
      </fieldset>

      {state.error && <p role="alert" className="notice notice-error">{state.error}</p>}
      {pending && <p role="status" className="text-sm font-bold text-teal">{imageMode === "ai-pick" ? "Writing your caption and matching a photo…" : imageMode === "upload" ? "Finding the punchline in your photo…" : "Writing your punchline…"} This can take a moment.</p>}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6">
        <p className="text-sm text-ink/45">{imageMode === "none" ? "One scene in, one original caption out." : "A photo. A punchline. Your next meme."}</p>
        <SubmitButton>{imageMode === "none" ? "Make the punchline →" : "Create my meme →"}</SubmitButton>
      </div>
    </form>
  );
}
