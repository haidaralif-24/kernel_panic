# CONCEPT.md

**Competition:** iWISE, Ai & Web Programming Challenge, Escape Room
**Working title:** Kernel Panic

> **Note:** This describes a plan. Details may change as development progresses.

---

## 1. Premise

You are an intruder connected to a locked-down machine. The system has detected you and a **trace countdown** is running. When it reaches zero, your connection is terminated. The only way out is to break through five security layers and reach the root shell. The final layer is guarded by the machine's own AI.

The escape is literal: you are trying to break out of a sandbox before it closes around you. This keeps the project clearly an escape room (locked stages, sequential unlocking, timer, a clear exit) while using a theme that is cheap to build, because the whole experience is an interface rather than illustrated rooms.

All systems, commands and data are fictional.

---

## 2. Requirements Coverage

| Challenge requirement | How the game meets it |
|---|---|
| At least 5 stages, different puzzle types | 5 layers: decryption, data analysis, code repair, forensics, prompt engineering |
| Sequential unlocking | The server releases the next layer only after the current flag is valid |
| Hints | 3 progressive tiers per layer, each with a score penalty |
| Timer | The trace countdown, based on server timestamps |
| Scoring from time, hints, attempts | See section 5, with a visible breakdown at the end |
| JavaScript interactions | Terminal, windows, editor with sandboxed code runner, animations |

---

## 3. Interface

A **hybrid fake desktop**:

- A persistent **terminal panel** with a few commands (`help`, `status`, `hint`, `submit LAB{...}`) for atmosphere and power users.
- **Clickable windows** for each puzzle so everything also works by mouse or touch: Files (layers 1 and 2), Editor (layer 3), Browser (layer 4), Guard Chat (layer 5).
- A permanent **status bar**: current layer, trace countdown, hints used, failed logins, score so far.
- Start with two or three window types. Terminal-only is the fallback if time runs short.

Design rules:
- High contrast and large text (avoid low-contrast green on black).
- Keyboard and touch support, not only terminal typing.
- Polish matters: boot sequence, typing effect, sound, glitch transition, a satisfying ACCESS GRANTED moment.
- Mobile layout: windows become tabs.

---

## 4. Gameplay Flow

1. Boot screen explains the premise and rules in a few lines.
2. The trace countdown starts when the player clicks Connect.
3. The player solves layer 1, submits the flag, and the server unlocks layer 2, and so on.
4. A hint can be requested at any time, with a visible penalty.
5. Reaching the root shell ends the run and shows the score breakdown.
6. If the countdown reaches zero, the run ends with partial credit. A **demo mode** with extended time exists for judging.

---

## 5. Scoring

Computed on the server from the signed session. Numbers are starting values to tune after playtesting.

```
score = max(0, 1000 - timePenalty - hintPenalty - attemptPenalty)
```

| Factor | Rule | Cap |
|---|---|---|
| Time | 1 point per 5 seconds beyond a 15 minute par | 400 |
| Hints | Tier 1: 25, tier 2: 50, tier 3: 100 (per layer) | none |
| Attempts | 10 points per wrong flag | 200 |

- **Trace countdown:** 45 minutes per run, shown in the status bar. **Demo mode:** 90 minutes.
- **Partial credit if the trace expires:** `layersCompleted * 100 - hintPenalty - attemptPenalty`, minimum 0.
- **Example:** finished in 22 minutes, 3 hints (tier 1, tier 1, tier 2 = 100), 5 wrong attempts:
  time penalty 84, hints 100, attempts 50, score = 1000 - 84 - 100 - 50 = **766**.
- **Result screen** shows each component (time, hints, failed logins, final score) so the three required factors are visible. Cosmetic ranks: 900+ Ghost, 700+ Operator, 400+ Script Kiddie, otherwise Intruder.

Tuning checklist: playtest with 3 or more people, compare real times to the par time, check hint penalties feel meaningful but not punishing, confirm 45 minutes is generous enough.

---

## 6. AI in the Project

- **Gatekeeper (layer 5):** an LLM plays the guard. Whether the player won is decided by code that checks the reply for the passphrase, never by the model. A scripted fallback guard takes over automatically if the API fails.
- **Optional:** a hint assistant that nudges without revealing answers, and Jev for classifying wrong attempts to choose a hint tier.
- **Disclosure for the submission:** list every AI tool used in the product and during development, what each was used for, what the team did itself, and how AI output was verified. Undisclosed AI use can lead to penalties.

---

## 7. Scope Tiers

**Must have**
- Layers 1, 2 and 4 working end to end
- Server-enforced progression and hashed flag checks
- Countdown, three hint tiers, attempts, scoring with breakdown
- Deployment and a backup demo video
- Submission materials with the AI-usage disclosure

**Should have**
- Layer 3 (code repair) and layer 5 (AI guard with scripted fallback)
- Sound, animation and mobile layout
- Demo mode

**Nice to have**
- AI hint assistant, Jev classification, Supabase leaderboard, rank labels

If time runs short, cut from the bottom up. A smaller game that works end to end beats a larger one that is half-built. If five stages are required, keep simplified versions of layers 3 and 5 rather than dropping them.

---

## 8. Judging Prep

- Every team member must be able to explain the whole system, not just their own part. Only registered members may answer questions.
- Keep a local copy and a recorded demo as a backup, since technical problems do not earn extra time.
- Be ready to answer: where answers are stored, how timer tampering is prevented, how player code runs safely, how the AI win is detected, what happens if the AI is down, and how the score is calculated.

---

## 9. Non-Goals

- Real hacking tools, exploits or targets
- A server-side code compiler
- A full operating system simulation
- Multiplayer (possible later)
