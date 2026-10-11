import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-black tracking-tight text-white">
          Punchline<span className="text-amber-400">.</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold text-zinc-300 sm:gap-5">
          <Link href="/" className="hidden transition hover:text-white sm:block">Feed</Link>
          {user && (
            <>
              <Link href="/create" className="transition hover:text-white">Create</Link>
              <Link href="/members" className="hidden transition hover:text-white sm:block">Members</Link>
              <Link href="/profile" className="transition hover:text-white">Profile</Link>
              <form action="/auth/signout" method="post">
                <button className="rounded-full border border-zinc-700 px-4 py-2 transition hover:border-zinc-500 hover:text-white">
                  Sign out
                </button>
              </form>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
