# Punchline

A Next.js + Supabase campus-humor app with Google OAuth, Gemini caption generation, authenticated ratings, user profiles, and strict row-level security.

## Local setup

1. Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
GEMINI_API_KEY=your-server-only-gemini-key
```

2. Apply the SQL files in `supabase/migrations` in filename order using the Supabase SQL editor (or run `supabase db push` if the project is linked).

3. In Google Cloud, create a Web OAuth client and add the Supabase callback URL shown under **Supabase → Authentication → Providers → Google** as an authorized redirect URI. Put the Google client ID and secret in that Supabase provider screen.

4. In **Supabase → Authentication → URL Configuration**, set the Site URL to the deployed app and add both redirect URLs:

```text
http://localhost:3000/auth/callback
https://YOUR-VERCEL-DOMAIN/auth/callback
```

The application intentionally passes `/auth/callback` without custom query parameters to `signInWithOAuth`.

5. Start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What is included

- `profiles` table keyed to `auth.users`, with nullable `first_name` and `last_name`
- `auth.users` insert trigger plus a backfill for existing accounts
- Row-level security so users can only access their own profile
- Public `profile-photos` Storage bucket with size/type restrictions and owner-only writes
- Google OAuth and `/auth/callback` PKCE code exchange
- Cookie-backed SSR auth with automatic session refresh
- Protected `/members` and `/profile` routes
- First-login profile completion prompt and editable profile/photo UI
- Protected `/create` studio backed by the Gemini API
- Public AI-caption feed with stored prompts and model metadata
- One immutable authenticated vote per user and generation
- Vote totals maintained by a database trigger without exposing other users' vote rows
- RLS enabled and forced on every public table

## Deployment checklist

- Add the two public Supabase environment variables to Vercel.
- Turn off Vercel Deployment Protection so OAuth works in an incognito window.
- Add the production `/auth/callback` URL to Supabase's redirect allow list.
- Test Google sign-in, profile completion, photo upload, sign-out, and direct access to `/members` while signed out.
- Submit Vercel's commit-specific deployment URL.
