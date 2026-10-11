export const metadata = { title: "Terms — Punchline" };

export default function TermsPage() {
  return (
    <main className="px-6 py-16">
      <article className="mx-auto max-w-3xl space-y-8 text-zinc-300">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">Legal</p>
          <h1 className="mt-3 text-4xl font-black text-white">Terms of Service</h1>
          <p className="mt-3 text-sm text-zinc-500">Last updated October 11, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Using Punchline</h2>
          <p>Punchline is a demonstration application provided as-is. You may use it for lawful purposes and must not attempt to disrupt the service or access another user&apos;s account or data.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Your account</h2>
          <p>You are responsible for access to your Google account and for the information you upload. Do not upload content you do not have permission to use.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Availability and changes</h2>
          <p>The service may change or become unavailable without notice. These terms may be updated as the application evolves.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Contact</h2>
          <p>Questions about these terms can be sent to jl6742@columbia.edu.</p>
        </section>
      </article>
    </main>
  );
}
