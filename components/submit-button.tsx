"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="primary-cta border-0 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Cooking…" : children}
    </button>
  );
}
