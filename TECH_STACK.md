# TECH_STACK.md

**Goal:** keep the stack as constant as possible. Items marked **Locked** should not change without a team discussion. **Swappable** and **Optional** items can change cheaply.

> **Note:** This is a plan. Items may change if an open question is answered differently than expected or something proves impractical.

---

## 1. Locked Core

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js (App Router) | Frontend and server routes in one repo, easy deploy |
| Language | TypeScript (strict) | Catches mistakes early, shares types client and server |
| UI | React | Required by Next.js |
| Styling | Tailwind CSS | Fast to build, shared tokens for developer and designer |
| Hosting | Vercel | One-click deploy, preview link per branch |
| Server logic | Next.js route handlers | Few endpoints needed |
| Package manager | pnpm with pinned Node version | Reproducible installs |
| Repository | GitHub, pull requests per layer | Clear history of who built what |

## 2. Swappable Parts

| Need | Default | Alternative |
|---|---|---|
| Code editor (layer 3) | CodeMirror 6 | Monaco (heavier) |
| Running player code | Web Worker or sandboxed iframe, JavaScript only | Pyodide for Python |
| Drag and drop | dnd-kit | Native HTML5 |
| Draggable windows | Pointer events or `react-rnd` | Fixed layout (fastest) |
| Terminal | Custom lightweight component | xterm.js |
| Animation | Motion (Framer Motion) | CSS only |
| Sound | Native `Audio` | Howler |
| Client state | Zustand | React context + `useReducer` |
| Validation | Zod, shared by client and server | Manual checks |
| UI components | shadcn/ui | Plain Tailwind |
| Testing | Vitest (scoring, flags, puzzle logic) | Add Playwright for a full run |

**Locked decision:** player code execution is **JavaScript only**.

---

## 3. No Database in the Core

Answers are a small fixed set kept in server-only code. Progress lives in a signed cookie.

### Session cookie `kp_session`
Signed (using `jose`), httpOnly, SameSite=Lax, Secure.

```json
{
  "sid": "random id",
  "startedAt": 1766000000000,
  "layer": 1,
  "hints": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  "failed": 0,
  "guardTurns": 0,
  "completedAt": null,
  "demo": false
}
```

- `layer` is 1 to 5, or 6 when finished. `hints[n]` is the highest tier used on layer n (0 to 3).
- It holds progress only, never answers. Editing it breaks the signature.
- Timing uses `startedAt`, so the countdown cannot be paused client-side.

---

## 4. API Endpoints

All endpoints: JSON, Zod validation, rate limited, `401` if the session is missing or invalid.

| Endpoint | Purpose |
|---|---|
| `POST /api/session` | Create or read the run, return countdown info |
| `POST /api/flag` | Validate `{ layer, flag }`, advance the layer, count failures |
| `POST /api/hint` | Release the next hint tier for the current layer, record the penalty |
| `POST /api/challenge` | Layer 3 challenge-response (server sends inputs, client returns outputs) |
| `GET /api/intranet` | Serve layer 4 simulated pages so hidden clues are not in the bundle |
| `POST /api/guard` | Proxy the AI gatekeeper, with scripted fallback |
| `POST /api/score` | *(Optional)* compute the final score on the server and save it |

Key responses:
- `/api/flag` correct: `{ ok: true, nextLayer, finished }`. Wrong: `{ ok: false, failed }`. Skipping or replaying a layer: `409`. Trace expired: `410`.
- `/api/guard` returns `{ reply, turnsLeft, breached, flag }`. `breached` is true only when the server finds the passphrase in the reply.

Limits: flag length 64, guard message 500 characters, 8 guard turns per run, 10 flag submissions per minute and 6 guard calls per minute per session, AI timeout 10 seconds.

Edge cases: refresh restores the run from the cookie, a tampered cookie returns `401` and starts a new run, an expired trace returns `410` with partial credit.

---

## 5. Where Answers Live

| Data | Location |
|---|---|
| Flag fingerprints | `lib/server/answers.ts` with `import "server-only"` at the top |
| `FLAG_SECRET`, `SESSION_SECRET`, AI API key | Environment variables (Vercel settings, local `.env.local`) |
| Guard passphrase | Environment variable, used only in the guard route and its win check |
| Hint text | Server-only file, one tier at a time via `/api/hint` |
| Layer 4 hidden clues, layer 3 test cases | Served by route handlers, never in the client bundle |

**Flag checking with HMAC:** store an HMAC-SHA256 of each flag keyed by `FLAG_SECRET`, not the plain text. A leaked repo is then useless for guessing. Normalize the submission (trim), compute the HMAC, and compare with `crypto.timingSafeEqual`. A small script generates the fingerprints. Plain flags stay in private notes outside the repo. Flags use the format `LAB{...}` with 12 or more random characters.

**Never** use the `NEXT_PUBLIC_` prefix for a secret.

---

## 6. AI Layer

- LLM called only from the server route, with a small fast model.
- Controls: rate limiting, 10 second timeout, input length caps, turn cap.
- Scripted fallback guard if the API fails.
- Win check in code, never by the model.
- Optional: Jev for classifying wrong attempts into hint tiers, behind a feature flag so it can be dropped.

---

## 7. Optional Module: Supabase

Not part of the core. Add only after the game works end to end. The game must keep working if it is down.

- **Use for:** a leaderboard (`scores`: nickname, score, time, hints, attempts, created_at), optional anonymous sign-in, optional analytics.
- Only the Next.js server writes, using the service-role key kept server-side.
- The score is computed on the server from the session, never accepted from the client.
- Row Level Security on for every table: public read of leaderboard columns only, no public writes.
- Nicknames only, validated. Show "leaderboard unavailable" if the database is unreachable.
- Free-tier projects can pause when inactive, so check before judging.
- **Do not use it for** flags, the AI guard, or progress gating.

---

## 8. Security Rules and Pre-Submission Checklist

Rules:
1. Server-only modules use `import "server-only"`.
2. Progress is a signed cookie. The server never trusts progress in a request body.
3. Hints are released one tier at a time by the server.
4. Scores are computed on the server.
5. Player code runs only in the browser sandbox (Worker or iframe with a 2 second timeout, no DOM or network access), never on the server.
6. The AI model never decides success.
7. Do not log flags, guard messages or secrets.
8. `.env*` files are gitignored. Only `.env.example` with placeholders is committed.
9. Check the `Origin` header on POST requests.
10. The real session cookie is never part of a puzzle. Any "cookie" shown in layer 4 is fictional page content.

Known limitations to state honestly: anonymous sessions make rate limits best-effort, a client-side fallback for layer 3 can be bypassed by a determined player, and LLM output varies between runs.

Checklist before submitting:
- [ ] Search the built client bundle for flags, hints and secrets
- [ ] Edit the cookie manually and confirm it is rejected
- [ ] Call `/api/flag` for a later layer and confirm `409`
- [ ] Try sending a score directly and confirm it is ignored
- [ ] Run an infinite loop in the editor and confirm the timeout works
- [ ] Confirm repository history contains no secrets
- [ ] Confirm the demo works with the AI provider disabled

---

## 9. Deliberately Avoided

- A separate Go service (a second deployment with little benefit here)
- A database in the core
- Server-side execution of player code
- New libraries after about day 6 unless needed to fix a bug

## 10. Stability Practices

- Pin exact dependency versions and commit the lockfile.
- Pin Node (`.nvmrc` and `engines`).
- Use the latest stable releases at the start, then do not upgrade mid-project.
- Keep `.env.example` listing every variable.
- Run lint, type-check and Vitest in CI on every pull request.
- Write one line of reasoning for each choice so every member can explain it to judges.

## 11. Open Questions

- Does the frontend teammate work in React?
- Is an AI API key and budget available? If not, the scripted guard becomes the main version.
- Is the Supabase leaderboard worth the time?
- Challenge-response or client-side tests for layer 3?
