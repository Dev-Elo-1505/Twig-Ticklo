# Ticklo — Twig Ticketing 

A small server-rendered ticketing app (PHP + Twig) with a Tailwind-based UI, optimistic client updates, and a simple JSON-backed persistence layer (for demo/development).

## Tech stack / libraries

- PHP 8.x (vanilla PHP served via built-in server or in Docker)
- Twig (templating)
- Tailwind CSS (CDN used; optional local build via npm)
- Symfony HttpFoundation polyfill (small Request/Response helper included)
- Plain JavaScript for client behavior (`public/js/app.js`)
- Composer for PHP dependencies
- Docker (optional) — repository contains a Dockerfile for containerized deployment

Frontend packages (optional / development):
- Node.js + npm (for building CSS if you choose to use the local toolchain)

## What this repo provides

- Server-rendered UI using Twig templates under `src/views/`
- Tickets flow: list, create, edit, delete (server endpoints under `public/index.php` wired to `src/Controllers/TicketController.php`)
- Data persistence to JSON files in `data/` (use `DATA_DIR` env var to change path / mount a persistent disk in the container)
- Client-side optimistic updates and modal handling in `public/js/app.js`

## Quick start — Local development (recommended)

Prerequisites:
- PHP 8.x installed
- Composer installed

Install PHP dependencies (if any):

```bash
composer install
```

Start the PHP built-in server (serves the site at http://localhost:10000 by default):

```bash
# from project root
php -S 0.0.0.0:10000 -t public
```

Open your browser to: http://localhost:10000

Notes:
- The app reads/writes JSON files to `data/` by default. To persist data across containers or environments, set the `DATA_DIR` environment variable to a directory you control; the helper will create it.

## Docker (optional)

Build and run locally with Docker (example):

```bash
# build
docker build -t twig-ticklo:dev .

# run (map port and optionally mount local data directory)
docker run --rm -p 10000:10000 -v "$(pwd)/data:/app/data" twig-ticklo:dev
```

When deploying to Render or other platforms, mount a persistent disk for `DATA_DIR` and set the environment variable accordingly so tickets persist.

## Routes / endpoints

- GET / — Landing page
- GET /auth/login — Login
- POST /auth/login — Login submit
- GET /auth/signup — Signup
- POST /auth/signup — Signup submit
- GET /dashboard — Dashboard (per-user stats)
- GET /tickets — Tickets page (list)
- POST /tickets/create — Create ticket (returns JSON if `X-Requested-With: XMLHttpRequest` present)
- POST /tickets/:id/edit — Edit ticket (returns JSON for AJAX)
- POST /tickets/:id/delete — Delete ticket (returns JSON for AJAX)
- GET /tickets/stats — Returns per-user stats in JSON

## Data storage

- Tickets are stored in `data/tickets.json` as an array of ticket objects. Each ticket contains:
  - `id` (string)
  - `title` (string)
  - `description` (string)
  - `status` (one of `open|in_progress|closed`)
  - `user` (email string)
  - `created_at` (timestamp string)

The server uses the `user` property (from `$_SESSION['user']['email']`) to scope tickets to the signed-in user.

## UI components & state (short)

- Layout and shared components:
  - `src/views/layouts/base.twig` — base layout with navbar, footer, toast rendering, and logout modal.
  - `src/views/component/appnavbar.twig` — top navbar (logo and Logout button).
  - `src/views/component/create-ticket.twig` — create/edit ticket modal (form).
  - `src/views/component/delete-ticket.twig` — delete confirmation modal.

- Pages:
  - `src/views/tickets.twig` — Tickets page, contains tickets grid and uses `create-ticket` modal.
  - `src/views/dashboard.twig` — Dashboard page, shows per-user stats (total, open, in_progress, closed).

- Client state (in `public/js/app.js`):
  - Optimistic in-page state (not a React-style store): the script inserts/updates/removes ticket DOM nodes and keeps a `window.__pendingTicketRequests` array of in-flight fetch promises so navigation to dashboard waits for saves.
  - Form data is read at submit time, optimistic card is inserted immediately, and a background POST sends the data to the server. If the server returns JSON with the canonical id, the client reconciles the optimistic id with the server id.

## Accessibility notes

- Modals set `role="dialog"` and `aria-modal="true"` and the client focuses the first input/button when opened where possible.
- The logout modal and the create/edit modal include accessible buttons and use the `Escape` key to close modals. Overlays are clickable to dismiss.
- The app uses semantic HTML where appropriate (`button`, `h3`, `form`, `label`).

Known accessibility gaps / TODOs:
- Focus trapping inside modals is not implemented (currently we focus the first input but focus can escape the modal). Add focus trap for full accessibility.
- There are no ARIA live regions for toast notifications — this would help screen reader users notice success/error messages.

## Known issues and caveats

- Client-side caching of `public/js/app.js` can cause stale behavior (missing recent fixes). Use hard-refresh (Ctrl+Shift+R) to make sure you load the latest JS when testing.
- The UI uses optimistic updates; if the background request fails, the UI will not fully roll back automatically (delete shows an alert on failure). Consider adding undo or retry UX.
- The server-generated ticket `id` (uniqid) will replace optimistic IDs after a successful create; the client reconciles IDs but there can be edge cases with concurrent updates from multiple clients.

## Testing & linting

- Quick PHP syntax checks:

```bash
# run from repo root
php -l src/Controllers/TicketController.php
php -l src/Controllers/DashboardController.php
# and any other PHP files you changed
```

- Manual smoke test:
  - Start the dev server, log in, create a ticket, navigate to the dashboard and ensure stats update, return to tickets and confirm persistence in `data/tickets.json`.

## Example test user credentials

The demo uses a minimal session-backed auth system. Example seeded/test credentials (if you used the signup flow, your user's email is used):

- Email: test@example.com
- Password: password123

(If a signup flow exists in your environment, register a new user and use that account.)

## Troubleshooting

- If tickets are not persisting:
  - Check `data/tickets.json` exists and is writable by PHP.
  - If running in Docker or on Render, set `DATA_DIR` environment variable to a writable directory and mount a persistent volume.

- If dashboard counts are not updating when navigating immediately after create:
  - Ensure the browser loaded the updated `public/js/app.js` (hard-refresh).
  - The client waits for in-flight requests before navigating to `/dashboard`; if you still see stale counts, check the Network tab to confirm the create POST returned 200 and (for AJAX) returned JSON with `stats`.

## Deployment notes (Render)

- Mount a persistent disk and set the `DATA_DIR` env var in Render so `tickets.json` persists.
- The Dockerfile included in the repo can be used to build the image for Render.


