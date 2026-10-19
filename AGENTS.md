# AGENTS.md

Instructions for AI coding agents working in this repository. Humans can read it too.

## Project

**Kernel Panic** (working title) is a browser-based escape room for the iWISE Ai & Web Programming Challenge. The player is an intruder trapped in a locked-down computer, with a trace countdown running. They crack five CTF-style layers (decryption, memory dump, code repair, forensics, AI gatekeeper) to reach the root shell. Everything is fictional and simulated.

The planning documents are a **plan, not a spec**. They can change. If you change a decision, update the matching document in the same change.

## Read First

Before starting a task, read the document that matches it:

| Task | Read |
|---|---|
| Anything new | `docs/CONCEPT.md` (premise, interface, scoring, scope tiers) |
| Stack, endpoints, cookie, security | `docs/TECH_STACK.md` |
| A puzzle layer | `docs/PUZZLE_PLAN.md` |

If the documents and the code disagree, say so and ask instead of guessing.

## Commands

```bash
npm run dev         # dev server at http://localhost:3000
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest run
```

Run typecheck, lint and tests before saying a task is done. Use npm only (no yarn or pnpm). Node 22.12 or newer.

## Stack (locked)

Next.js App Router, TypeScript (strict), React, Tailwind CSS, npm, Vitest, Zod, `jose`, Zustand. Dependencies are pinned to exact versions.

- Ask before adding a dependency. Prefer what is already installed.
- Do not upgrade packages as a side effect of another task.
- Player code runs in **JavaScript only**, in a browser sandbox.
- There is no database in the core. Progress lives in a signed cookie. Supabase is an optional leaderboard only.

## Architecture in One Paragraph

The browser only displays state. The **server is the authority** on progress, hints, flags and scores. Route handlers under `src/app/api/` implement `session`, `flag`, `hint`, `challenge`, `intranet`, `guard` (and optionally `score`). Progress is stored in a signed httpOnly cookie (`kp_session`) that never contains answers. Contracts and limits are in `docs/TECH_STACK.md`.

Suggested layout (create as needed):

```
src/app/api/…        route handlers
src/lib/server/…     server-only code (answers, hints, guard prompt, session signing)
src/lib/shared/…     types, Zod schemas, pure scoring logic (safe for client and server)
src/components/…     desktop shell, terminal, windows, status bar
private/             git-ignored notes (real flags and solutions)
docs/                planning documents
```

## Hard Rules (do not break these)

1. **Answers never reach the browser.** Flags, hint text, layer 3 test cases, layer 4 hidden clues and the guard passphrase live only in server code or environment variables. Every file in `src/lib/server/` starts with `import "server-only"`.
2. **No secret may use the `NEXT_PUBLIC_` prefix.**
3. **Flags are stored as HMAC-SHA256 fingerprints** keyed by `FLAG_SECRET`, compared with `crypto.timingSafeEqual`. Never store or commit a plain flag.
4. **Never trust the client for progress, time or score.** Read them from the verified session. Scores are computed on the server.
5. **The AI model never decides whether the player won.** Code checks the guard's reply for the passphrase. Always keep the scripted fallback guard working when the API is down.
6. **Player code never runs on the server.** Run it in a Web Worker or sandboxed iframe with a timeout, no network and no access to the page or cookies.
7. **The real session cookie is never part of a puzzle.** Any cookie shown in layer 4 is fictional page content.
8. **Validate every request with Zod**, with length limits, and rate limit every endpoint.
9. **Do not log** flags, guard messages, secrets or full request bodies.

## Files You Must Not Read, Print or Commit

- `.env.local` and any real `.env*` file (only `.env.example` is committed)
- everything under `private/` (real flags, solutions, passphrase)

Do not paste their contents into code, comments, tests, commit messages or chat. Use placeholders like `<SHIFT>` or `LAB{example}` in tests and docs. If a task seems to need a real answer, ask the human.

## Code Conventions

- TypeScript strict. No `any` and no `@ts-ignore` without a comment explaining why.
- Keep scoring, flag checking and puzzle logic as small **pure functions** with Vitest tests. The scoring formula is in `docs/CONCEPT.md`.
- Client components only where needed (`"use client"`): terminal, windows, editor, timer display. Load the code editor lazily with `ssr: false`.
- Accessibility: everything must work by keyboard and touch, not only terminal typing. Keep contrast high and text readable.
- The timer is computed from `startedAt` timestamps, not from counting intervals.
- Keep it simple. This is a competition project with a short schedule, so prefer the smallest change that works over new abstractions.

## Scope Rules

Priorities, in order: **must** (layers 1, 2 and 4, server-enforced progression, countdown, hints, scoring, deployment), **should** (layers 3 and 5, polish, demo mode), **nice** (hint assistant, Jev, leaderboard). Do not start a lower tier while a higher one is unfinished unless asked. Do not add features that are not in `docs/`. Suggest them instead.

## Definition of Done for a Task

- It works through the real endpoints, not only in the UI.
- Typecheck, lint and tests pass.
- No answers, secrets or private content were added to the client bundle or the repo.
- Any changed decision is reflected in `docs/`.
- You listed what you did not test.

## Working With the Human

- Say what you are about to change before large edits, and keep changes small and reviewable.
- Every team member must be able to explain the whole system to the judges, so prefer clear code and short comments over clever code.
- All AI assistance on this project must be disclosed in the submission, so mention anything non-trivial you generated.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
