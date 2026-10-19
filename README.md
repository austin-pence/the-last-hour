# The Last Hour

A paperless, mobile-first twelve-player mystery. Firebase Hosting serves the static app; anonymous Firebase Authentication identifies players; the allowlisted Google host controls the live game from a phone. Realtime Database rules validate answers against private data. No Cloud Functions, Cloud Run, or billing upgrade is required.

Players join using an invitation code and atomically claim one named slot. The browser retains the anonymous identity. A slot cannot be transferred by players. The host starts the shared 60-minute clock, confirms travel arrivals, approves the physical rally, releases hints, verifies secret-mission statements, conducts spoken interviews without a per-speaker limit, designates the final writer, and announces the verdict. Keep the host control screen connected for automatic puzzle-to-travel releases; reopening reconciles an already accepted solution.

## Privacy model

The repository and static build contain no canonical role mapping, route, private witness cards, correct puzzle answers, or game invitation codes. A private game pack is loaded into the database by the authorized host or deployment administrator. Do not commit `private/` or export the production database into the public repository.

`config/hostEmail` is administrator-provisioned. Host access requires a verified Google identity matching that value. Players cannot read the database root, answer table, other players' roles/cards, future acts, or the sealed team ballot. Witness letters are stored separately and released after the chain is accepted. The rally riddle is copied into shared state only after host approval.

Knowing an invitation code allows a person to join an unclaimed named slot, by design. A name is not proof of identity. Share the invitation with the intended players and ask each to choose only their own name. A returning player must use the same browser/profile; clearing browser data loses the anonymous identity. The trusted host can repair a lost-device assignment administratively.

## Development

Use Node 20+ and Java 21+ for Firebase emulators. Run `npm ci`, `npm test`, and `npm run test:rules`. The tests cover host authorization, slot ownership, private data isolation, answer checks, paused/expired submissions, rally gating, witness-letter release, and sealed ballot constraints. CI runs these tests against a demo project and never contacts the production database.

The optional `npm run test:browser` rehearsal needs the private game pack at `private/game-pack.json` and Chrome installed (or set `CHROME_PATH`). It simulates twelve isolated mobile browsers through all seven acts. Emulator connections are enabled only at `localhost` with `?emulator=1`.

Build with verified public Firebase configuration in `private/firebase-config.json`, then run `npm run build`. The build copies only the four public app files and the Firebase web configuration into `dist/`. It does not copy the private pack. Deploy rules and Hosting with the authenticated Firebase CLI. The deployment's auth configuration and bootstrap email are kept outside version control.

## Operational limits

Internet access is required to join and submit. Reconnects restore committed progress and the synchronized clock. New submissions are rejected while paused or expired; offline local changes are never treated as accepted solutions. The host remains the trusted authority for arrivals, physical play, observed mission statements, and the final spoken reveal. Spoken interviews happen in person and are not recorded. Final ordered pairs are submitted together, once, by the designated writer; no correctness feedback is provided before the host's reveal.
