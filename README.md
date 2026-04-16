# Kendra's Chair — Tres Jolie Hair

A React + TypeScript website for Kendra, a hair stylist at Tres Jolie Hair in Lynnwood, WA. Features an interactive client gallery that showcases the professions of her clients, a password-protected admin panel for managing client profiles, and a public-facing landing page with salon info.

---

## Tech Stack

| Tool | Version |
|------|---------|
| React | 18 |
| TypeScript | 5.6 |
| Vite | 5 |
| React Router | v6 |
| uuid | v9 |

Deployed on **Vercel** with a serverless API route for GitHub PR creation.

No UI framework — all styles are plain CSS using CSS custom properties.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, about section, photo gallery, quick links, contact info |
| `/gallery` | Client Gallery | Interactive gallery with search, profession filters, and sort |
| `/client/:id` | Client Detail | Individual client profile with portfolio photos |
| `/admin` | Admin Panel | Password-protected CRUD interface for managing clients |

---

## Features

### Public

- **Hero section** with animated sparkles and a scroll-to CTA
- **About section** with Kendra's bio and a zoomable photo
- **Photo gallery** with lightbox and prev/next navigation
- **Client gallery** — search by name or profession, filter by profession chips, sort A–Z / Z–A / by profession
- **Client detail pages** — full profile with portfolio photos, social links, contact info, and favorite service badge
- **Booking link** to GlossGenius

### Admin (`/admin`)

- Password gate (session-persisted)
- Add, edit, and delete client profiles
- Profile photo upload with drag-to-crop modal
- Portfolio photo uploads (multiple, compressed automatically)
- **Open PR** button — submits all pending changes to GitHub as a pull request
- Merging the PR triggers an automatic Vercel deployment

---

## Data Storage

Client records are stored in `public/clients.json` inside the repository. The site fetches this file at load time. Images are stored as files under `public/images/`.

This means all data is version-controlled — every client add, edit, or delete is a commit with a full history and easy rollback.

### Admin Workflow

1. Go to `/admin` and sign in
2. Add, edit, or delete clients as needed (changes are held in local state)
3. Click **Open PR** — the admin panel calls the serverless API, which:
   - Creates a new branch in the GitHub repo
   - Commits the updated `clients.json` and any new image files
   - Opens a pull request
4. Review and merge the PR on GitHub
5. Vercel automatically redeploys within ~1 minute

### Client Schema

```ts
interface Client {
  id: string;
  name: string;
  profession: string;
  profDesc: string;       // Short description of their role
  pronouns: string;
  favService: string;     // Favorite Tres Jolie Hair service
  website: string;
  notes: string;          // Services offered, one per line
  photo: string | null;   // Path to image file, e.g. /images/abc123-profile.jpg
  portfolio: string[];    // Array of image paths, e.g. /images/abc123-portfolio-0.jpg
  instagram: string;
  tiktok: string;
  email: string;
  phone: string;
}
```

### Photo Compression

- **Profile photo** — cropped to a 400×400 square via an in-browser drag-to-crop tool, saved as JPEG at 85% quality
- **Portfolio photos** — scaled down to max 800px width, saved as JPEG at 80% quality
- Max upload size: 15 MB per file

---

## Deployment

The site is deployed on Vercel. Vercel automatically deploys on every push to `master` via the GitHub integration — no manual workflow needed.

### Environment Variables

Set these in **Vercel → Project Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | Fine-grained PAT with **Contents: Read & Write** and **Pull requests: Read & Write** on this repo |
| `GITHUB_OWNER` | GitHub username or org that owns the repo |
| `GITHUB_REPO` | Repository name (e.g. `KendrasChair`) |
| `GITHUB_BASE_BRANCH` | Branch PRs target (default: `master`) |

See [`.env.example`](.env.example) for a template.

---

## Design System

### Colors

| Variable | Value | Use |
|----------|-------|-----|
| `--cream` | `#fdf6ee` | Page background |
| `--green` | `#506844` | Primary accent, buttons, frame border |
| `--brown` | `#5c3d2e` | Body text |
| `--brown-dark` | `#3b2a1e` | Headings |
| `--blush` | `#e8c5a0` | Decorative accents |
| `--rose` | `#c97d5a` | Gradient highlights |
| `--muted` | `#8a6e5c` | Secondary text |
| `--border` | `#e4d0bc` | Borders and dividers |

### Typography

- **Headings** — Playfair Display (Google Fonts), 700–800 weight
- **Body** — Segoe UI / system-ui

### Layout Details

- Fixed 10px green border frame around every page (`body::before`)
- Responsive grid using `auto-fill` / `minmax` — no breakpoint-heavy CSS
- Animated sparkles in the hero and gallery header generated dynamically with randomized positions, sizes, and animation delays

### Profession Colors

Each profession in the gallery is assigned one of 8 distinct color themes (pink, green, blue, amber, purple, teal, orange, magenta) based on alphabetical sort order, so colors stay consistent across sessions.

---

## Project Structure

```
api/
└── submit-changes.ts    # Vercel serverless function — creates GitHub branch, commits files, opens PR
public/
├── clients.json         # Source of truth for all client data
└── images/              # Client profile and portfolio photos
src/
├── main.tsx             # React entry point
├── App.tsx              # Router setup
├── index.css            # Global styles, CSS variables
├── types/
│   └── index.ts         # Client interface, SortMode type
├── context/
│   └── ClientsContext.tsx  # Fetches clients.json; provides clients + setClients
├── utils/
│   ├── storage.ts       # Fetches /clients.json
│   ├── colors.ts        # Profession chip color mapping
│   ├── image.ts         # Canvas-based image compression + crop
│   └── auth.ts          # sessionStorage auth helpers
├── components/
│   ├── Lightbox.tsx/.css    # Photo lightbox with keyboard navigation
│   └── CropModal.tsx/.css   # Drag-to-crop profile photo modal
└── pages/
    ├── Home.tsx/.css         # Landing page
    ├── Gallery.tsx/.css      # Client gallery
    ├── ClientDetail.tsx/.css # Individual client view
    └── Admin.tsx/.css        # Admin panel
```

---

## Admin Password

The default admin password is `Oliver`. It is checked against `sessionStorage` so it persists for the browser session but resets when the tab is closed.

To change it, update the `ADMIN_PASSWORD` constant in [src/utils/auth.ts](src/utils/auth.ts).
