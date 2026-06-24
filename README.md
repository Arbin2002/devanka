# Devanka IT Solutions — Website

## Structure

```
devanka/
│
├── index.html                  Public pages (kept at root for clean URLs)
├── products.html
├── case-studies.html
├── case-study-details.html
│
├── admin/
│   └── index.html              Admin dashboard (login-protected)
│
├── assets/
│   ├── images/                 Service & section images
│   └── logos/                  Brand logos and favicons
│
├── js/
│   ├── public/                 Frontend scripts (team, products, contact, etc.)
│   ├── admin/                  Admin CRUD logic (dashboard, cases, testimonials)
│   └── shared/
│       └── supabase.js         Single Supabase client — shared across all scripts
│
├── css/                        Bootstrap + custom theme styles
├── lib/                        Third-party libraries (Owl Carousel, WOW.js, etc.)
├── scss/                       Source SCSS files
│
└── docs/
    └── architecture.md         Architecture and data flows
```


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JS |
| Styling | Bootstrap 5, custom SCSS |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (`portfolio_images` bucket) |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) |



## Getting Started

### Prerequisites
- A browser (no build step — this is plain HTML/JS)
- Access to the Supabase project

### Run Locally
```bash
npx serve .
```
Open [http://localhost:3000](http://localhost:3000)

### Admin Panel
Navigate to [`/admin/`](http://localhost:3000/admin/) locally or `admin.devanka.com.np` in production.
Login with your Supabase Auth credentials.



## Deployment

**Single repository. Single deployment. Two subdomains.**

| Subdomain | Serves | Path in repo |
|---|---|---|
| `devanka.com.np` | Public website | `/` (root HTML files) |
| `admin.devanka.com.np` | Admin dashboard | `/admin/index.html` |

Both subdomains point to the **same Cloudflare Pages deployment** of this repository.
Cloudflare routes traffic based on the hostname — no second repo, no second pipeline.

### How to set up subdomain routing on Cloudflare

1. Deploy this repo to Cloudflare Pages → your site gets a `*.pages.dev` URL.
2. Add a custom domain `devanka.com.np` → points to site root (`/`).
3. Add a second custom domain `admin.devanka.com.np` → set the root path to `/admin/`
   (Cloudflare Pages allows per-subdomain path configuration).
4. Done — one deployment, two clean URLs.

### Benefits over separate deployments
- ✅ One repository, one `git push`
- ✅ One Supabase project and one set of credentials
- ✅ Shared `assets/`, `css/`, `lib/` — no duplication
- ✅ Easier to maintain and onboard new developers



## Key Supabase Tables

| Table | Purpose |
|---|---|
| `contact_submissions` | Contact form entries from the website |
| `portfolio_projects` | Products shown on the Products page |
| `team_members` | Team section on the homepage |
| `testimonials` | Client testimonials carousel |
| `case_studies` | Case study cards and detail pages |



## Documentation

See [`docs/architecture.md`](docs/architecture.md) for the full architecture reference, data flows, and onboarding guide.



## License

Private — © Devanka IT Solutions Pvt. Ltd. All rights reserved.
