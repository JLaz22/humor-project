"use client";

import { useFormStatus } from "react-dom";

function VoteButton({
  value,
  label,
  tone,
}: {
  value: 1 | -1;
  label: string;
  tone: "up" | "down";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      name="value"
      value={value}
      disabled={pending}
      aria-label={label}
      className={`vote-button ${tone === "up" ? "vote-up" : "vote-down"}`}
    >
      <span aria-hidden>{tone === "up" ? "↑" : "↓"}</span>
      {pending ? "Counting…" : label}
    </button>
  );
}

export function VoteButtons({ generationId }: { generationId: number }) {
  return (
    <div className="flex gap-2">
      <input type="hidden" name="generationId" value={generationId} />
      <VoteButton value={1} label="Hits" tone="up" />
      <VoteButton value={-1} label="Skip" tone="down" />
    </div>
  );
}
