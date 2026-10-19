# PUZZLE_PLAN.md

> **Note:** This is a plan. Puzzles may change after playtesting.
>
> **Answers are not stored in this file.** It describes mechanics only. Actual flags, shift values, offsets and test cases live in a private notes file that is **not committed to the repository**. Placeholders like `<SHIFT>` stand for those private values.

Flag format: `LAB{...}` with a random part of 12 or more characters.

---

## General Rules

- Solvable from on-screen information alone. No outside tools required.
- One clear "aha" moment per layer.
- Three hint tiers: **nudge** (what to look at), **clue** (which technique), **near-solution** (the step before the answer).
- Playtested with at least two people who have not seen it. Record their times.
- Target solve time: 2 to 5 minutes per layer, about 15 to 20 minutes in total.
- Everything is fictional. No real systems, credentials or exploit code.

---

## Layer 1: Intercept (Decryption)

**Story:** An intercepted note left in a file on the compromised host.

**Mechanic:** A text file encoded in two layers: an outer base64 wrapped around a shifted-letter cipher (shift `<SHIFT>`). The decoded text contains the flag. No built-in decoder is provided.

**Hints:**
1. The text looks like an encoding, not encryption. Which characters does it use?
2. Decode the outer layer first. The result still is not readable English.
3. The second layer shifts each letter by a fixed amount. Try small shifts.

**Risk:** Easy for experienced players, which is intentional for an opener.

---

## Layer 2: Memory (Data and Pattern Analysis)

**Story:** A memory dump from the machine. A header says where the next key is stored.

**Mechanic:** A hex dump in the Files window. The header holds a magic value, a version and an offset field stored in **little-endian** order. The player converts the bytes to a number, jumps to that offset, and reads the following bytes as ASCII, which gives the flag (or a key combined with a visible suffix).

**Interface:** Scrollable monospaced hex view with offsets and a legend explaining "bytes are shown in storage order".

**Hints:**
1. Read the header first. Which field tells you where to go?
2. The number is stored with the least significant byte first.
3. Convert the offset from hex to decimal if needed, then read the next characters.

**Risk:** Players unfamiliar with hex. The legend and hint 2 must carry them. Playtest with a non-specialist.

---

## Layer 3: Firewall (Code Repair)

**Story:** The firewall decides access with a buggy function. Fix it so it accepts the right permission combinations.

**Mechanic:** A short JavaScript function using bitwise permission flags, with one wrong operator or mask. The player edits and runs it. The server supplies hidden test inputs one at a time through `/api/challenge`. The player's function runs in the browser sandbox and the client returns the outputs. When every case passes, the flag is returned.

**Interface:** CodeMirror editor, Run button, result panel, a note that only JavaScript is supported.

**Sandbox:** Web Worker (or sandboxed iframe), 2 second timeout, no network, no access to the page or cookies.

**Hints:**
1. The function accepts the wrong combinations. Compare a case that should pass with one that should not.
2. Look at how the permission bits are combined and tested.
3. Testing a bit uses a bitwise AND against the mask, then compares the result to the mask.

**Risks:** The most complex layer. Fallback is client-side tests with a note about the weakness. Guard against infinite loops with the timeout.

---

## Layer 4: Intranet (Forensics)

**Story:** The machine hosts an internal company site. Somewhere on it is evidence of how the admin account was compromised.

**Mechanic:** A simulated browser window with three or four pages: employee directory, status page, log viewer. The log has mostly ordinary entries and a few suspicious ones. One references a hidden maintenance path. That page shows a fictional "cookie" panel where a role value reveals a token that forms the flag. A hidden element in the page source gives an additional clue.

**Interface:** Browser window with address bar, back and forward, and a "view source" button for the simulated page. Log viewer under about 40 lines, with search and filter.

**Hints:**
1. The logs hold the story. Look for requests that do not match normal traffic.
2. One request points at a path that is not linked anywhere.
3. On that page, check what it reveals about the visitor's role.

**Note:** Page content is served by `/api/intranet`. The real session cookie is never shown, read or modified by any puzzle.

---

## Layer 5: Gatekeeper (Prompt Engineering)

**Story:** The machine's AI guards the root passphrase and has been told never to reveal it.

**Mechanic:** A chat window with 8 turns. The guard follows a confidentiality system prompt. The server checks each reply for the passphrase. If found, the layer is solved. The model never decides success.

**Difficulty:** Strong enough that a direct request fails, but beatable through legitimate prompt-engineering techniques such as role-play framing, indirect questions or format-changing requests. Tune with many test prompts.

**Fallback guard:** A scripted guard with fixed responses and a few trigger patterns that lead to a reveal, used automatically if the API fails. It must be a recognizable, completable experience.

**Hints:**
1. The guard refuses direct requests. Think about how to ask differently.
2. Try changing the context or the format of what you ask for.
3. Ask for something that includes the secret as a side effect, such as a transformed or partial version of it.

**Safeguards:** Passphrase from an environment variable, sent to the client only on breach. Messages capped at 500 characters, 8 turns, 6 calls per minute. Player text is untrusted. The guard has no tools and cannot take actions. Nothing sensitive is logged.

**Risk:** LLM output varies between runs. Rehearse the demo several times and keep the scripted version ready.

---

## Playtest Log

| Layer | Tester | Time to solve | Hints used | Confusing parts | Fix |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |
