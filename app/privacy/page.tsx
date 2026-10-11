export const metadata = { title: "Privacy — Punchline" };

export default function PrivacyPage() {
  return (
    <main className="px-6 py-16">
      <article className="mx-auto max-w-3xl space-y-8 text-zinc-300">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">Legal</p>
          <h1 className="mt-3 text-4xl font-black text-white">Privacy Policy</h1>
          <p className="mt-3 text-sm text-zinc-500">Last updated October 11, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Information we collect</h2>
          <p>When you sign in with Google, Punchline receives your email address and basic Google profile information. You may also provide a first name, last name, and profile photo. We store the scenarios you submit for caption generation, the generated captions, and your votes.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">How we use and store information</h2>
          <p>We use this information to authenticate you, display your profile, generate and publish captions, record ratings, and provide members-only features. Account, profile, generation, and rating data are stored with Supabase. Profile photos are stored in Supabase Storage rather than in the relational database.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Sharing and retention</h2>
          <p>We do not sell your personal information. Your generation scenario is sent to Google Gemini to create a caption. Data is otherwise shared only with service providers needed to operate the app, including Google, Supabase, and Vercel. We retain it while your account is active or as needed to operate the service.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Your choices</h2>
          <p>You can update your name and profile photo from the Profile page. To request account or profile deletion, contact jl6742@columbia.edu.</p>
        </section>
      </article>
    </main>
  );
}
