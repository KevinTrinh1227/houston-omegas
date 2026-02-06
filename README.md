# Houston Omegas Website

Official website for Houston Omegas — [houstonomegas.com](https://houstonomegas.com)

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Styling:** Tailwind CSS 4
- **Hosting:** Cloudflare Pages (static export)
- **Forms:** Cloudflare Pages Functions (Discord webhook)
- **Fonts:** Inter, Cinzel, Metal Mania (Google Fonts)
- **Icons:** Lucide React, React Icons

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage (dark theme) — hero, sponsors, about, events, merch, gallery, recruitment, CTA |
| `/rent` | Venue rental — gallery, pricing, FAQ, inquiry form |
| `/recruitment` | Recruitment info — interest form, FAQ, brotherhood gallery |
| `/partners` | Sponsorship tiers, current partners, CTA |
| `/merch` | Merchandise catalog, sizing guide, how to order |
| `/contact` | Contact form (general inquiries) |
| `/history` | Chapter timeline |
| `/blog` | Coming soon placeholder |
| `/disclaimer` | Legal disclaimer & affiliation notice |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/login` | Member login (placeholder) |
| `/links` | Linktree-style social links page |

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build    # Next.js static export to /out
npm run deploy   # Build + deploy to Cloudflare Pages
```

## Project Structure

```
src/
├── app/           # Pages (App Router)
├── components/    # Shared components (Navbar, Footer, SponsorsTicker, etc.)
└── hooks/         # Custom hooks (useCountdown)
functions/
└── api/           # Cloudflare Pages Functions (inquiry, recruitment webhooks)
public/
└── images/        # Static assets
```

## Environment Variables

Set in Cloudflare Pages dashboard:

- `DISCORD_WEBHOOK_URL` — Discord webhook for form submissions
