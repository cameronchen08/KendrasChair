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
- All client data stored in `localStorage`
- Optional file-based storage — connect a JSON file to auto-save on every change

---

## Data Storage

Client records are stored in `localStorage` under the key `kendra_clients`. This is the same key used by the original vanilla JS version of the site, so data is fully compatible between both versions.

### File-Based Storage (Optional)

The admin panel supports connecting a `.json` file on disk as a persistent data store. Once connected, every add, edit, and delete automatically writes the full client list to the file in addition to `localStorage`.

**How to use:**

1. Go to `/admin` and sign in
2. In the controls bar, click **New File** to create a new `kendra-clients.json`, or **Open File** to connect an existing one
3. A green **✓ File connected** badge confirms the connection
4. All changes from that point forward are written to the file automatically
5. Click **Disconnect** to unlink the file without losing any data

The JSON file uses the same schema as `localStorage` and can be backed up, shared, or re-imported at any time.

> **Browser support:** File-based storage uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) and requires **Chrome or Edge**. The connection resets on page reload — click **Open File** to reconnect each session.

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
  photo: string | null;   // Base64 JPEG (cropped to 400×400)
  portfolio: string[];    // Base64 JPEG array (compressed to max 800px wide)
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
src/
├── main.tsx                 # React entry point
├── App.tsx                  # Router setup
├── index.css                # Global styles, CSS variables
├── types/
│   └── index.ts             # Client interface, SortMode type
├── utils/
│   ├── storage.ts           # localStorage read/write helpers
│   ├── fileStorage.ts       # File System Access API helpers (optional file sync)
│   ├── colors.ts            # Profession chip color mapping
│   ├── image.ts             # Canvas-based image compression + crop
│   └── auth.ts              # sessionStorage auth helpers
├── components/
│   ├── Lightbox.tsx/.css    # Photo lightbox with keyboard navigation
│   └── CropModal.tsx/.css   # Drag-to-crop profile photo modal
└── pages/
    ├── Home.tsx/.css        # Landing page
    ├── Gallery.tsx/.css     # Client gallery
    ├── ClientDetail.tsx/.css # Individual client view
    └── Admin.tsx/.css       # Admin panel
```

---

## Admin Password

The default admin password is `Oliver`. It is checked against `sessionStorage` so it persists for the browser session but resets when the tab is closed.

To change it, update the `ADMIN_PASSWORD` constant in [src/utils/auth.ts](src/utils/auth.ts).

---

## Original Site

This is a TypeScript/React rebuild of the original vanilla HTML/JS site located at:

```
../Kendra Website/
```

The original site's `localStorage` data is fully compatible — both versions read from and write to the same `kendra_clients` key.
