# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Environment Variables

Requires a `.env.local` file (not committed) with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_AI_API_KEY=        # Free key from https://aistudio.google.com/apikey — powers simplification
```

`GOOGLE_AI_API_KEY` is optional; if absent, the simplify route returns mock output. Translation uses MyMemory (no key required).

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Supabase, MyMemory API (translation), Google Gemini 1.5 Flash (simplification).

### App Structure

The app has two pages and three API routes:

- `app/page.tsx` — Homepage with hero, document carousel, feature grid (animation-heavy, client component)
- `app/translate/page.tsx` — Core product UI: PDF upload, language picker, document type selection, results display
- `app/api/extract-pdf/route.ts` — Extracts text from uploaded PDFs using `pdf-parse` (requires Node.js runtime)
- `app/api/translate/route.ts` — Translates text using MyMemory API (free, no key); chunks input at 450-char word boundaries to respect the API limit; falls back to mock
- `app/api/simplify/route.ts` — Sends translated text to Gemini 1.5 Flash (`GOOGLE_AI_API_KEY`) for structured JSON output (plain explanation, key points, urgent actions); falls back to mock

`components/SelectionTranslator.tsx` is mounted globally in the root layout — it listens for text selection anywhere on the page and pops up an inline translation (the "easter egg" feature).

### Translation Pipeline (end-to-end)

1. User uploads PDF → `POST /api/extract-pdf` returns plain text
2. User picks language & doc type → `POST /api/translate` returns translated string
3. `translate/page.tsx` immediately calls `POST /api/simplify` with the translation result
4. UI renders four panels: original text, translation, simplified explanation, urgent actions

### Key Conventions

- **Dark mode only** — all UI is designed for dark backgrounds; no light mode support.
- **Path alias:** `@/*` maps to the project root.
- **External server packages:** `pdf-parse` is listed in `next.config.ts` as a server-only external package — do not attempt to use it client-side.
- **No active Supabase usage** in the current API routes; the client is imported in `lib/` but document storage/auth is not wired up yet.
- **Tailwind CSS v4** is used via `@tailwindcss/postcss` — syntax differs from v3 (no `@apply` layer imports needed).
