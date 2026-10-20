# The Last Hour

A mobile mystery for up to twelve named players, using Firebase Hosting, anonymous player authentication, a verified allowlisted Google host, and Realtime Database rules. It stays on Spark: no Functions, Cloud Run or billing upgrade.

## New rounds

Roles are drawn privately when the host starts, using only joined active players. The murderer count is 20% rounded to the nearest whole person, with a minimum of one: five players get one, ten get two, and twelve get two. There is no accomplice role in new rounds. Each murderer gets an independently shuffled agenda from a private host library. Randomness uses Web Crypto with rejection sampling; reconnects never redraw roles. Players see only their own role and agenda.

The lobby explains the game once. Active screens show the current task and controls; story, case notes, private roles and host tools use expandable sections. All seven route puzzles, shared fields, server-side answer validation, arrivals, hints, interviews, pause/resume and departure coverage continue to work.

At the final stop the host verifies each agenda and opens voting. If every murderer succeeded, the team gets two candidate groups; otherwise up to three, capped for tiny groups. Each guess must identify the entire murderer set, with no duplicate suspects or repeated candidate groups. One active writer seals every guess together, before expiry. The host announces whether any group was an exact match. No intermediate correctness feedback is exposed.

## Host operation

Mark people who are not playing as away before starting. Departures after the draw never change assignments or the initial suspect roster. Current missing clues are covered for the active group; future clues and unreleased letters stay gated. Away players cannot submit; interviews skip them and a departed writer is cleared. The host may privately cover their character and verify their agenda. Offline phones alone do not change attendance.

Keep the host screen connected for automatic accepted-answer releases. Reopening reconciles progress. Reset requires typing RESET, clears assignments/progress/attendance, and returns everyone to pending roles until the next draw. Completed legacy rounds keep their original verdict and role format until the host explicitly resets; deployments never reset games.

Host recovery requires OVERRIDE. It can reopen an act, complete a stuck challenge, or adjust time. For new rounds, use the final agenda review instead of the legacy count recovery. Reopening clears later answers, drafts and final approval; sealed-ballot clearing needs an explicit choice. Attendance and recovery carry server-validated round/progress/phase stamps.

## Privacy and development

Never commit private/ or production exports. The private pack holds the route, answers, original personal clues and agenda library. Google host access requires the configured verified email. Players cannot read other roles/agendas, answer keys, future clues or sealed votes. Invitation codes let intended participants claim their own names; a name is not identity verification. Returning players must reuse the same browser.

Use Node20+ and Java21+ with npm ci, npm test and npm run test:rules. CI tests synthetic data against a demo project. The browser rehearsal requires the ignored private game pack and Chrome; run npm run test:browser. Build with private/firebase-config.json using npm run build; only public modules and Firebase web configuration enter dist. Emulator connections are localhost-only with ?emulator=1.
