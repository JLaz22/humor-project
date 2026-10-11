"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="rounded-full bg-amber-400 px-6 py-3 font-bold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Cooking…" : children}
    </button>
  );
}
