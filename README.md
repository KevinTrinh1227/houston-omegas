# Houston Omegas

[![Live Site](https://img.shields.io/badge/🌐_Live-houstonomegas.com-black?style=for-the-badge)](https://houstonomegas.com)
[![Cloudflare Pages](https://img.shields.io/badge/Hosted_on-Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

> Official website & member dashboard for **Houston Omegas** — an Asian-interest fraternity in Houston, TX. Brotherhood, service, and tradition since 2004.

[![WhatsApp Community](https://img.shields.io/badge/Join_WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/BuN7ZMjKR4Z06QWWe1q3vP)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/houstonomegas/)

---

## 🌐 Live Pages

### Public Site
| Page | URL | Description |
|------|-----|-------------|
| **Homepage** | [houstonomegas.com](https://houstonomegas.com) | Hero, events, about, gallery |
| **Events** | [/events](https://houstonomegas.com/events) | Upcoming parties & events |
| **Recruitment** | [/recruitment](https://houstonomegas.com/recruitment) | Rush info, interest form, FAQ |
| **Venue Rental** | [/rent](https://houstonomegas.com/rent) | Book Omega Mansion |
| **Merch** | [/merch](https://houstonomegas.com/merch) | Official apparel |
| **Partners** | [/partners](https://houstonomegas.com/partners) | Sponsorship tiers |
| **Blog** | [/blog](https://houstonomegas.com/blog) | Articles & SEO content |
| **Links** | [/links](https://houstonomegas.com/links) | Link-in-bio page |
| **History** | [/history](https://houstonomegas.com/history) | Chapter timeline |
| **Contact** | [/contact](https://houstonomegas.com/contact) | General inquiries |

### Member Dashboard (auth required)
| Page | Description |
|------|-------------|
| `/dashboard` | Main dashboard with stats & activity |
| `/dashboard/members` | Member directory & profiles |
| `/dashboard/events` | Event management |
| `/dashboard/finance` | Dues & payment tracking |
| `/dashboard/payments` | Stripe payment admin |
| `/dashboard/socials` | Social media management (Postiz) |
| `/dashboard/content` | Blog & SEO content management |
| `/dashboard/settings` | Organization settings |
| `/dashboard/settings/roles` | Roles & permissions management |

### Internal Tools
| Tool | URL | Description |
|------|-----|-------------|
| **Social Media Manager** | [social.houstonomegas.com](https://social.houstonomegas.com) | Postiz — cross-posting & scheduling |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, React 19) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Hosting** | Cloudflare Pages (static export) |
| **Database** | Cloudflare D1 (SQLite) |
| **API** | Cloudflare Pages Functions |
| **Auth** | Google OAuth, Discord OAuth, Phone OTP, WebAuthn/Passkeys |
| **Payments** | Stripe (tickets, dues, merch) |
| **Social Media** | Postiz (self-hosted) |
| **SEO Engine** | VisibleSeed SEO Engine (auto-generated content) |
| **Fonts** | Inter, Cinzel, Metal Mania |
| **Icons** | Lucide React, React Icons |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
AUTH_SECRET=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# SEO Engine
SEO_ENGINE_URL=http://localhost:3010
SEO_ENGINE_API_KEY=
SEO_BRAND_ID=3

# Social Media
POSTIZ_API_KEY=
POSTIZ_BASE_URL=https://social.houstonomegas.com
```

---

## 📁 Project Structure

```
├── src/
│   ├── app/           # Next.js pages (App Router)
│   ├── components/    # Reusable React components
│   └── lib/           # Utilities & helpers
├── functions/
│   ├── api/           # Cloudflare Pages Functions (API routes)
│   └── lib/           # Server-side libraries (auth, stripe, etc.)
├── migrations/        # D1 database migrations
├── public/            # Static assets (images, fonts, manifest)
└── wrangler.toml      # Cloudflare config
```

---

## 🔗 Community

- **WhatsApp**: [Join Group Chat](https://chat.whatsapp.com/BuN7ZMjKR4Z06QWWe1q3vP)
- **Instagram**: [@houstonomegas](https://www.instagram.com/houstonomegas/)
- **Website**: [houstonomegas.com](https://houstonomegas.com)
- **Venue Inquiries**: [houstonomegas.com/contact](https://houstonomegas.com/contact)

---

## 📄 Legal

- [Terms of Service](https://houstonomegas.com/terms)
- [Privacy Policy](https://houstonomegas.com/privacy)
- [Disclaimer](https://houstonomegas.com/disclaimer)

---

<p align="center">
  <strong>Houston Omegas</strong> · Est. 2004 · Houston, TX<br/>
  <sub>Built with ❤️ by <a href="https://visibleseed.com">VisibleSeed</a></sub>
</p>
