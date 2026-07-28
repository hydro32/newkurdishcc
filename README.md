# کوردیش تیوب — KurdishTube

A Kurdish (Sorani, RTL) video-sharing site built with Next.js 16, React 19,
and Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's here

- **`src/data/videos.ts`** — the in-memory video dataset (18 sample videos
  across 9 categories) plus helpers (`getVideoById`, `getRelatedVideos`,
  `getFeaturedVideo`). Swap this for a real database/API when you're ready.
- **`src/app/`** — one route per page: home, `/categories`, `/search`,
  `/watch/[id]`, `/upload`, `/profile`, `/login`, `/register`, `/stories`.
- **`src/components/layout/`** — `Navbar`, `Sidebar`, `Footer`, and
  `AppShell` (the shared page chrome with the mobile drawer).
- **`src/components/video/`** — `VideoCard`, `VideoGrid`, `CategoryChips`,
  `VideoActions` (like/dislike/share).
- Kurdish text is set in **Noto Kufi Arabic** (via `next/font/google`);
  Latin/mono text uses Geist Mono. The document is `lang="ckb" dir="rtl"`.

## Known limitations (by design, since this is a front-end-only demo)

- **No backend.** `/upload`, `/login`, and `/register` are UI only — nothing
  is persisted or authenticated.
- **No real video files.** `/watch/[id]` points at `public/videos/demo.mp4`,
  which is a placeholder, not a playable file. Thumbnails and avatars are
  real images served from `picsum.photos` / `i.pravatar.cc` (already
  whitelisted in `next.config.ts`).
- **Age gate** is a client-side `localStorage` flag, not real age
  verification.

## Suggested next steps

- Wire `/upload` to real storage (e.g. S3/Cloudflare R2) + a database.
- Add real auth (NextAuth/Clerk/etc.) for `/login`, `/register`, `/profile`.
- Replace the static `videos.ts` dataset with API routes / a CMS.
- Add a proper `<video>` player (hls.js or Vidstack) for adaptive streaming.
