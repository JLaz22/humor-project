import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="text-xl font-black tracking-[-0.04em] text-cream">
          punchline<span className="text-lime">*</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-bold text-cream/65 sm:gap-5">
          <Link href="/#feed" className="hidden transition hover:text-cream sm:block">Explore</Link>
          {user && (
            <>
              <Link href="/create" className="transition hover:text-cream">Create</Link>
              <Link href="/profile" className="transition hover:text-cream">Profile</Link>
              <form action="/auth/signout" method="post">
                <button className="rounded-full border border-cream/20 px-4 py-2 transition hover:border-lime hover:text-cream">
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
