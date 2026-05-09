# ClipAI — AI Short-Form Video Creator

A production-ready React + TypeScript frontend for an AI-powered short-form video generation app.
Targets TikTok, Instagram Reels, and YouTube Shorts.

---

## Tech Stack

| Layer     | Technology                      |
|-----------|----------------------------------|
| Frontend  | React 18, TypeScript, Vite       |
| Styling   | CSS Variables (no external lib)  |
| State     | React hooks (no Redux needed)    |
| Backend   | Rust (connect via `/api` proxy)  |
| Fonts     | Syne (display) + DM Sans (body)  |

---

## Project Structure

```
src/
├── types/
│   └── index.ts              # All shared TypeScript types
├── styles/
│   └── globals.css           # Design system CSS variables + global styles
├── hooks/
│   ├── useGenerationSettings.ts   # Settings state (style, ratio, platform…)
│   └── useGenerations.ts          # Generation list + API simulation
├── components/
│   ├── layout/
│   │   └── Navbar.tsx        # Top navigation bar
│   ├── sidebar/
│   │   ├── LeftSidebar.tsx   # Style, ratio, duration, platform controls
│   │   └── RightSidebar.tsx  # Resolution, sliders, plan card, history
│   ├── studio/
│   │   ├── PromptInput.tsx   # Prompt textarea + quick tags + generate btn
│   │   ├── VideoCard.tsx     # Individual video card + new generation card
│   │   └── VideoGrid.tsx     # Tabbed grid of all video generations
│   └── shared/
│       ├── Button.tsx        # Reusable button (primary/ghost/secondary)
│       └── Badge.tsx         # StyleBadge + StatusBadge
└── App.tsx                   # Root component — wires everything together
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → localhost:8080 for your Rust backend)
npm run dev

# Build for production
npm run build
```

---

## Connecting to Your Rust Backend

In `useGenerations.ts`, replace the simulation block:

```typescript
// REPLACE THIS:
await new Promise(resolve => setTimeout(resolve, 4000));

// WITH YOUR REAL API CALL:
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, ...settings }),
});
const data = await response.json();
// poll data.jobId or use WebSocket for status updates
```

Your Rust backend should expose:
- `POST /api/generate`   — start a generation job
- `GET  /api/status/:id` — poll for job completion
- `GET  /api/videos`     — list past generations

---

## Monetization (Ready to Wire Up)

The `UserPlan` type and credit bar in `RightSidebar` are ready for Stripe:

```typescript
// Replace MOCK_PLAN in App.tsx with a real fetch:
const plan = await fetch('/api/user/plan').then(r => r.json());
```

Recommended pricing tiers:
- **Free** — 10 credits/month
- **Pro** — 100 credits/month — $19/mo
- **Unlimited** — $49/mo

---

## Marketplace Listing Notes

When listing on AppSumo / Gumroad / Product Hunt:
- Screenshot the Studio view at 1440×900 for hero image
- Record a 60-second Loom of the generate flow for the demo video
- Key selling points: 3 styles, 4 platforms, instant generation, 4K output
