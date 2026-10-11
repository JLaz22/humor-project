import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

const errorMessages: Record<string, string> = {
  "name-too-long": "Names must be 80 characters or fewer.",
  "image-type": "Please choose a JPG, PNG, or WebP image.",
  "image-size": "Your photo must be 2 MB or smaller.",
  upload: "The photo could not be uploaded. Please try again.",
  save: "Your profile could not be saved. Please try again.",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data }, params] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, avatar_url").eq("id", user.id).maybeSingle(),
    searchParams,
  ]);
  const profile = data as Profile | null;
  const incomplete = !profile?.first_name || !profile?.last_name;

  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">Your account</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Profile</h1>
        <p className="mt-4 text-zinc-400">Keep your member card up to date.</p>

        {incomplete && (
          <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-amber-100">
            <p className="font-bold">One quick thing before you continue</p>
            <p className="mt-1 text-sm text-amber-200/80">Add your first and last name to finish setting up your profile.</p>
          </div>
        )}
        {params.saved && <p className="mt-8 rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-emerald-200">Profile saved.</p>}
        {params.error && <p className="mt-8 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-200">{errorMessages[params.error] ?? "Something went wrong."}</p>}

        <form action={updateProfile} className="mt-8 space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">
          <div className="flex items-center gap-5">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Your profile" className="size-20 rounded-full object-cover ring-2 ring-amber-400" />
            ) : (
              <div className="grid size-20 place-items-center rounded-full bg-zinc-800 text-2xl font-black text-zinc-500">
                {user.email?.charAt(0).toUpperCase() ?? "?"}
              </div>
            )}
            <div>
              <p className="font-semibold text-white">Profile photo</p>
              <p className="mt-1 text-sm text-zinc-400">JPG, PNG, or WebP. Maximum 2 MB.</p>
            </div>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-200">Choose a new photo</span>
            <input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:font-bold file:text-zinc-950" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-200">First name</span>
              <input name="firstName" defaultValue={profile?.first_name ?? ""} maxLength={80} placeholder="Ada" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-amber-400" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-200">Last name</span>
              <input name="lastName" defaultValue={profile?.last_name ?? ""} maxLength={80} placeholder="Lovelace" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-amber-400" />
            </label>
          </div>
          <div className="border-t border-zinc-800 pt-6">
            <p className="mb-4 text-sm text-zinc-500">Signed in as {user.email}</p>
            <button className="rounded-full bg-amber-400 px-6 py-3 font-bold text-zinc-950 transition hover:bg-amber-300">Save profile</button>
          </div>
        </form>
      </section>
    </main>
  );
}
