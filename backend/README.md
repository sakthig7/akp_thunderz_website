# AKP THUNDERz – Backend API

Node.js + Express + MongoDB (Mongoose) REST API for the AKP THUNDERz Cricket Club Management System.

## 1. Prerequisites

- Node.js 18+
- MongoDB installed and running locally (`mongod`)

## 2. Installation

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set JWT_SECRET, ADMIN_EMAIL/ADMIN_PASSWORD, etc.
```

## 3. Seed the database (creates the admin account + sample data)

```bash
npm run seed
```

This creates an admin user using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, plus a few sample players, matches, and a news post.

## 4. Run

```bash
npm run dev     # nodemon, auto-restart
# or
npm start
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`.

## 5. Folder structure

```
backend/
  config/db.js          Mongo connection
  controllers/           Route handler logic
  middleware/             auth (JWT), role authorization, upload (Multer), error handler
  models/                 User, Player, Match, Gallery, News, Registration, Contact
  routes/                 Express routers per resource
  uploads/                Uploaded player photos, gallery media, news covers, registration photos
  utils/                  errorResponse class, seed script
  server.js               App entry point
```

## 6. Auth

- `POST /api/auth/register` – public user signup
- `POST /api/auth/login` – user or admin login (role returned in response)
- `POST /api/auth/admin/login` – admin-only login (rejects non-admin accounts)
- `GET /api/auth/logout`
- `GET /api/auth/me` (protected)
- `PUT /api/auth/update-profile` (protected)
- `PUT /api/auth/change-password` (protected)
- `POST /api/auth/forgot-password` / `PUT /api/auth/reset-password/:token`

JWT is returned both in the JSON body (`token`) and as an httpOnly cookie. The frontend can use either — send `Authorization: Bearer <token>` or rely on the cookie with `credentials: 'include'`.

## 7. Resource APIs (all follow GET/POST/PUT/DELETE, admin-protected writes)

- `/api/players`
- `/api/matches`
- `/api/gallery` (multipart upload, field name `files`, up to 10 at once)
- `/api/news` (multipart upload, field name `coverImage`)
- `/api/registrations` (public POST to apply, admin manages via `/status`)
- `/api/contacts` (public POST, admin reads/manages)
- `/api/users` (admin only — manage all accounts)
- `/api/dashboard/stats` (admin only — aggregated counts + recent activity)

## 8. File uploads

Handled via Multer, stored under `backend/uploads/<players|gallery|news|registrations>/` and served statically at `/uploads/...`. Allowed types: jpg, jpeg, png, webp, mp4. Max size configurable via `MAX_FILE_SIZE_MB` in `.env`.

## 9. Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT auth with configurable expiry
- Role-based authorization middleware (`admin` vs `user`)
- Helmet, CORS (scoped to `CLIENT_URL`), rate limiting on `/api/*`
- Centralized error handler normalizes Mongoose/JWT errors into clean JSON

---

**Status: Backend complete.** Frontend (React) build starts next.

## 10. Live Scoring (ball-by-ball)

Beyond the basic `result{}` fields, matches support a full CricHeroes-style scoring engine stored in `liveMatchData` on the Match document.

- **Admin**: `PUT /api/matches/:id/live-state` — admin only. Body: `{ liveMatchData, status }`. The admin frontend computes the entire scoring state client-side (runs, extras, wickets, overs, batting/bowling cards) using `frontend/src/utils/scoringEngine.js` and pushes the full snapshot after every ball. The backend just stores it and derives a short `liveScore.text` headline automatically.
- **Public**: matches are returned as-is from `GET /api/matches` / `GET /api/matches/:id` — the `liveMatchData` blob is public so the Matches page and Match Detail page can render the live scorecard (current batsmen, bowler, run rate, recent balls, full innings-by-innings card) without extra requests.
- `liveMatchData` shape (per innings): `battingTeam`, `bowlingTeam`, `totalRuns`, `totalWickets`, `legalBalls`, `extras`, `target`, `striker`/`nonStriker`/`currentBowler` (live stats), `recentBalls` (last 12 deliveries), `battingCard`/`bowlingCard` (full card), `needsNewBowler`/`needsNewBatsman` flags.
- When the admin finalizes a match, `liveMatchData.finalResult` is mirrored into the existing `result{}` fields so older completed-match views keep working unchanged.

## 11. Player Accounts & Auto-Updated Stats

Only club players linked to a registered account can be selected in live scoring, and only their stats update automatically:

- **Linking**: in Admin → Manage Players, each roster entry has a "Linked User Account" dropdown (pulled from Manage Users). A player with no linked account shows as "Unlinked" in the table and simply won't appear as a selectable option during live scoring.
- **Enforcement in live scoring**: `GET /api/players?hasAccount=true` returns only linked players. The scoring UI uses this list for every AKP THUNDERz-side name field (openers, incoming batsman after a wicket, next bowler) — opponent-side fields stay free-text since opposing players never have accounts in this system.
- **Auto stat updates**: when a match is finalized (`status: 'Completed'` via `PUT /api/matches/:id/live-state`), `backend/utils/applyMatchStats.js` walks the finished `liveMatchData` and, for any AKP THUNDERz batting/bowling card entry whose name matches a *linked* Player, folds the runs/balls/wickets/dismissal into that Player's `stats` (matchesPlayed, runs, wickets, strikeRate, average — recomputed from running totals). This only ever runs once per match (`Match.statsApplied` guard), and opponent players — who were never in the Player collection to begin with — are never touched.
- The updated numbers show up immediately on that player's public profile page (`/team/:id`) since it's the same `Player.stats` the profile already reads.
