# Meme photos

The creation studio supports caption-only posts, uploaded JPG/PNG/WebP photos
(up to 3 MB), and AI photo matching. Gemini sees an uploaded photo when writing
its caption. For AI picks it returns up to three matching IDs from the bounded
Unsplash library in `lib/meme-photos.ts`; the server randomly selects one of those
matches. URLs are resolved in code, never supplied by the model. No match produces
an actionable retry message rather than an unrelated photo.

## Database setup

Apply `supabase/migrations/20261019000000_add_meme_photos.sql` to the same Supabase
project used by the app. This adds optional image metadata to `generations` and a
public `meme-photos` bucket with owner-scoped upload/removal policies. Existing
caption-only posts continue working. No new provider key is needed; the feature
uses the existing server-only `GEMINI_API_KEY`.

Next.js action bodies allow 4 MB to accommodate 3 MB uploads plus multipart
overhead while staying under Vercel's function payload limit. The server verifies
size, MIME type and file signatures, authenticates each generation request, and
cleans up the uploaded object if saving the post fails. Errors preserve the scene,
tone, photo mode and selected file so users can retry.

Published photos are public. The studio explains that AI receives uploaded photos
and asks users to use images they have permission to share. AI-picked photographs
are labeled separately from the AI-generated caption and link to Unsplash.

## Verification

```sh
node --experimental-strip-types --test tests/meme-media.test.mjs
npm run lint
npx next build --webpack
```

Signed-in checks: publish once with each photo mode, confirm the image and caption
appear in the feed, reload to verify persistence, and cast a vote. A mismatched or
oversized upload must be rejected before the AI request. A provider error should
leave the selected photo and scene ready for retry. Signed-out users must still
be redirected away from `/create`.

Provider references: [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output)
and [image understanding](https://ai.google.dev/gemini-api/docs/image-understanding).
