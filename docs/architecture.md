# Devanka IT Solutions — Architecture

> Why it was built this way, how data flows, and what to watch out for.

---

## High-Level Architecture

```
Browser
   │
   ▼
Static HTML / CSS / JS
(Cloudflare Pages — zero server)
   │
   ▼
Supabase
├── Auth          — Admin login
├── Database      — All dynamic content
└── Storage       — Uploaded images
```

There is no application server, no API layer, no backend framework.
Every page is a plain HTML file. JavaScript runs in the browser and talks directly to Supabase via its client SDK.

---

## Data Flows

### 1. Visitor Submits a Contact Form

```
Visitor fills out contact form
        │
        ▼
js/public/contact.js
        │
        ▼
Supabase — contact_submissions table
        │
        ▼
Admin Dashboard (Contact Submissions tab)
Admin reads the message
```

### 2. Public Page Loads Dynamic Content

```
Browser opens products.html
        │
        ▼
js/public/products.js runs on DOMContentLoaded
        │
        ▼
Supabase — portfolio_projects table (anon read)
        │
        ▼
Products rendered into the DOM
```
> Same pattern applies to `team.js`, `testimonials.js`, `case-studies.js`.

### 3. Admin Creates a Case Study

```
Admin logs in
        │
        ▼
Supabase Auth — validates session
        │
        ▼
Admin Dashboard — Case Studies tab
        │
        ▼
Admin fills out the case study editor
        │
        ▼
Hero image uploaded →  Supabase Storage (portfolio_images bucket)
        │
        ▼
js/admin/cases.js — inserts row into case_studies table
        │
        ▼
case-studies.html — card appears on public listing
        │
        ▼
case-study-details.html?id=<uuid> — full detail page loads
```

### 4. Admin Flow (All Tabs)

```
Admin visits admin.devanka.com.np
        │
        ▼
admin/index.html served
        │
        ▼
js/admin/dashboard.js checks Supabase session on load
        │  (no session → login form shown)
        │  (session exists → dashboard shown)
        ▼
Admin performs CRUD
        │
        ▼
Supabase — authenticated write to relevant table
        │
        ▼
Table reloads, UI updates in place
```

---

## Architecture Decisions

### Why Supabase?
- No backend to build, host, or maintain
- Built-in Auth, Database, and File Storage in one service
- Generous free tier — right-sized for a company website
- Client JS SDK works directly from the browser — no API proxy needed

### Why static HTML (no framework)?
- The site is a marketing website, not a web app — no need for React/Next.js complexity
- Zero build step — edit a file, push, it's live
- Cloudflare Pages serves static files at the edge globally with no configuration
- Any developer can open and understand an HTML file without tooling setup

### Why one repository / one deployment?
- Public pages and the admin panel share `assets/`, `css/`, `lib/`, and `js/shared/supabase.js`
- One `git push` updates everything — no sync between two repos
- One Supabase project, one set of credentials, one deployment pipeline
- Cloudflare subdomain routing (`admin.devanka.com.np → /admin/`) handles the separation cleanly

### Why public HTML pages stay at the root?
- Moving them to a subfolder (e.g. `/pages/`) would change every URL
- Google and other search engines have already indexed `devanka.com.np/products.html`
- Cloudflare redirects would be needed and introduce fragility
- Root HTML pages is the standard for static sites — no reason to change it

### Why `js/shared/supabase.js`?
- Previously every JS file hardcoded its own `createClient()` call with the URL and key
- A single shared client means credentials live in one place — easier to rotate, easier to audit
- Prevents race conditions from multiple Supabase clients initializing on the same page

### Why `js/public/` and `js/admin/` separation?
- Clear ownership: a developer touching the public site never needs to open `/js/admin/`
- Admin scripts are never loaded on public pages — smaller page weight
- Makes it obvious what's user-facing and what's internal tooling

---

## Security Model

| Layer | Mechanism |
|---|---|
| Admin access | Supabase Auth — email + password |
| Public reads | Supabase Row Level Security (RLS) — anon role can SELECT only |
| Admin writes | RLS — authenticated role can INSERT / UPDATE / DELETE |
| API key exposure | Only the `anon` (publishable) key is in the JS — no `service_role` key in client code |

> The `anon` key is safe to be public. It has no permissions beyond what RLS policies explicitly allow.

---

## Known Technical Debt

| Issue | Priority | Notes |
|---|---|---|
| WOW.js + jQuery dependency | Low | Heavy libraries for simple scroll animations — could be replaced with Intersection Observer API |
| Images not optimised | Medium | PNGs in `assets/images/` are large — should be converted to WebP and properly sized |
| No automated tests | Low | No unit or E2E tests — acceptable for a marketing site, but worth adding if the admin panel grows |
| Admin is a single HTML file | Low | All tabs live in one large `admin/index.html` — could be split into components if the panel grows significantly |
| Supabase keys in plain JS | Low | `anon` key is intentionally public; worth moving to environment variables if a build step is ever introduced |
| `lib/` is a local copy of third-party libraries | Low | Should eventually be replaced with CDN links or a package manager to stay up to date |
