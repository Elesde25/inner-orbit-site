# Inner Orbit

Cinematic, responsive astrology, numerology and personal-growth frontend prototype.

## Run

The current application is a Vinext/Cloudflare Worker with native `/library` and `/alchemy` routes and account-owned D1 APIs. The preserved main experience in `public/` uses hash routes. Serving only static files does not provide the Library account or journal APIs.

```bash
npm ci
npm run dev
npm run build
npm start
```

Use a local D1 database with the migrations in `drizzle/` for development. Do not apply these to production without a reviewed migration plan. See `docs/library-integration-2026-11-23.md` for the verified local environment and its limits.

## Destinations

Cinematic arrival, Home Galaxy / Celestial Soul Hub, three-step birth onboarding, Personal Blueprint, Resonance Engine, Show Me Why / How, Your Journey, Expert View, Connected Universes, Spirit Guides, Stardust Rewards and Our Supporters.

## Scope

The original main experience retains demonstration content. The uploaded Observatory, account Soul Journal, Inner Alchemy and native Celestial Library extend that original prototype; their actual storage and calculation boundaries are documented below. Library and journal accounts use server-side APIs and D1. Guest Library records stay in browser-local storage. No claim of complete platform-wide account synchronization, real payments, live social networking or production readiness is made.

## Design and accessibility

Purple, lavender and champagne gold; editorial Cormorant Garamond and DM Sans typography; custom cinematic artwork. The original main experience uses self-hosted fonts and assets. The Library additionally requests Google Fonts and uses fallback fonts when unavailable. Responsive layouts for narrow phones, tablet, desktop and ultrawide. Semantic controls, keyboard-accessible tabs, focus management on routing, visible focus, labeled forms, native dialog, progress element, status messaging, progressive-enhancement View Transitions, and reduced-motion support. Ambient starlight, a slow central orbit and gentle camera depth can be paused. Operating-system reduced-motion preferences disable spatial arrival and ambient animation.

## Home Galaxy foundation

The entry asks only for a visit-local display name; it is not authentication. A bounded, skippable 3.3-second inward transition connects the figure’s heart light to the visitor’s galaxy. Replay is available in the hub. The same first-party celestial avatar anchors entry, hub, and visitor preview. Six spatial objects open destination previews before entering the deeper prototype. Galaxy/list views, zoom/recenter, a private reflection prompt, and progress-linked Stardust are functional. Visitor preview hides the reflection prompt and local progress; it is a frontend demonstration, not a sharing mechanism.

`public/world.js` owns the world presentation and interactions. `public/world.css` owns the environment, motion, and responsive composition. The existing deeper features remain in `app.js` and `styles.css`.

## Historical main-experience validation

The following checks were reported for an earlier main-experience pass; they were not all rerun during Library integration. Current verification is recorded in the dated report below.

Syntax checks for both scripts. Browser checks at 320, 390, 768, 1365, and 2160 CSS pixel viewports, including destination previews, list mode, visitor mode, motion pause, named immediate entry, focus routing, and links back to Home Galaxy. Phone and ultrawide checks show no horizontal document overflow. All assets are local; the two environment WebP images total approximately 440 KB.

## Extension points

`public/app.js` separates view functions, route definitions, state, sample placements, growth paths, chart data and interaction bindings. `public/styles.css` contains visual tokens and responsive layouts. Add future routes to `destinations` and `views`. Add real calculation or service integrations only after replacing the sample-data contract and preserving privacy-first defaults.

## Generated asset

`public/assets/celestial.webp` was made using the built-in image generation tool with the two supplied design references, then optimized as WebP. Prompt: a premium cinematic self-discovery website background, no text or UI, luminous human figure woven from lavender stardust and gold constellations on the right, a gold heart light and fine orbital rings, deep purple cosmos and mountain horizon, dark negative space on the left, sophisticated game key art and volumetric lighting. Fonts are Cormorant Garamond and DM Sans, originally distributed through Google Fonts.

### Home Galaxy environment

`public/assets/home-galaxy.webp` was created with the built-in image generation tool and optimized as WebP. Final prompt: a spacious violet and champagne-gold spiral galaxy seen at a gentle oblique angle, intimate central gold star, flowing stardust rivers forming a personal celestial sanctuary, ink-plum space, amethyst nebula clouds, pinprick stars and subtle dimensional depth; premium cinematic game art; darker upper-left and lower corners for real interface controls; no people, architecture, lettering, UI, or foreground planets.

## Uploaded Observatory and account Soul Journal

The original static experience is preserved under `public/`. `#observatory` and `#expert` embed the uploaded React/Three.js chart; `#soul-journal` opens the shared journal. Prior chart tools remain under `#observatory-classic`. Actual chart inputs are browser-local, while explicitly saved journal questions, answers and context use account-owned D1 records.

Chart source: `observatory/`. Install its locked dependencies with `npm ci --prefix observatory`, then `npm run chart:build`. This updates the committed standalone chart under `public/observatory/`. Run the standard Sites build for the Worker and all static assets. Both sources must be committed together.

D1 schema/migrations: `db/schema.ts`, `drizzle/`. Account endpoints: `app/api/orbit/[...path]/route.ts`. Passwords use unique salts and PBKDF2-SHA256; sessions use random, server-hashed tokens in HttpOnly/SameSite cookies. Authentication attempts are throttled. Journal reads/deletes are scoped to the authenticated account. No passwords or session tokens are stored in localStorage.

`npm run test:journal` tests the actual API handler against SQLite through a D1-compatible adapter. It covers registration, login, saving, sign-out revocation, returning sessions, account separation, deletion authorization, validation and cross-origin rejection. Test accounts are ephemeral and never added to production. The uploaded calculation engine is unchanged.

Limitations: email verification and password recovery are not implemented; the UI discloses this. Journal accounts do not synchronize all existing browser-local universe progress or chart inputs. WebGL is optional: automatic interactive 2D fallback preserves chart and reading access. Hardware-backed 3D and physical iPad Safari require device QA.

## Inner Alchemy integration

The supplied seven-stage section lives in `components/alchemy/` and `app/alchemy/`. The existing `#alchemy` destination mounts it without changing other realms. `/api/journey` uses the existing D1 binding with the appended `0001_young_siren.sql` migration. Anonymous journeys are scoped to a private HttpOnly browser cookie; knowing a journey UUID does not grant access. These saves are browser-linked and distinct from Soul Journal accounts. Signed-in users can separately opt in to copy the local journey record into account sync; the account-sync bridge signals restored keys so the mounted journey can hydrate. The original local key is retained, and prior site progress is untouched.

Verification: intake and personalization, Calcination hold/release, save and refresh persistence, mobile layout, return navigation, chart panel clearance. `node tests/alchemy-api.mjs` covers server restore/erase, owner isolation, stale writes and validation. Chart changes are restricted to label-motion stabilization, transparent label textures, and measured panel clearance; calculation and interpretation code is unchanged. WebGL fallback is inspectable here; GPU animation and physical Safari still need device verification.

November 24, 2026: account opt-in sync restored a synthetic Alchemy journey, active stage, and reflection in a separate Chrome storage context on a fresh local Worker/D1 preview. A restore event connects account storage hydration to the mounted journey hook. The test account and journey were deleted; local D1 counts confirmed zero accounts, account snapshots, and Alchemy journeys. This is simulated context verification only; physical devices, account email verification/recovery, production migration/provider configuration and security review remain open. See `docs/library-account-safety-2026-11-23.md` for evidence.


## Native Celestial Library — navigation verification, November 23, 2026

Existing source at `22a823639fecfe3a95612963afec407d7c71379b` already integrated the recovered Library as React components at `/library`. Homepage and Soul Hub entry links are native; no Library iframe is used. `components/celestial-library/LibraryHost.tsx` connects the Library adapter to the shared account service and local recovery cache. `/api/library` uses revision-checked account-owned snapshots. Soul Journal remains separate, with explicit note-to-reflection copying.

This pass fixes Library URL/history state: notebook open/close, note-specific journal backlinks, validated chapter/passage links, UTF-16 passage offsets, reader remounts on explicit anchor jumps, and cancellation of pending room transitions during Back/Forward. Artwork, content and storage formats are unchanged.

```bash
node tests/library-navigation.mjs
node tests/library-model.mjs
node tests/library-api.mjs
```

See `docs/library-integration-2026-11-23.md` for test evidence, local preview commands and remaining gates. This pass was not pushed or deployed.


## Library account-switch safety — first scheduled cycle, November 23, 2026

Fixed a reproducible stale-request bug in `LibraryHost`: a late account A load could replace account B's state and persist it under B's local cache key. Loads, background checks, error reporting and write locks now respect the current account generation. Mounted readers keep their original adapter; an invalidated adapter rejects access rather than saving old data through another account's adapter. Failed saves retain dirty local recovery and can be retried.

Run the complete bounded suite with `npm run test:library`. It includes the real host and store hooks under controlled, deferred network responses, with a stub reading surface. The new regression reproduced the old-account overwrite before the fix. `react-test-renderer` is a development-only dependency pinned to the installed React version; it emits its upstream deprecation notice. No runtime test code or mock API is shipped.

Details and limitations: `docs/library-account-safety-2026-11-23.md`. This local cycle does not establish live cross-device, physical-browser or complete account-system security acceptance.

## Library logout and storage failure — November 23, 2026

Sign-out now waits for any active account save and stops while edits remain unsynced. A browser storage quota failure no longer prevents account sync; the status explains when the browser recovery copy could not be saved. Guest changes remain available for export during the current session.

`npm run test:library` covers deferred-save sign-out and simulated storage quota failure, plus prior account race, failed-save retry, API, model and navigation cases. See `docs/library-account-safety-2026-11-23.md`. Changes remain local and unpublished.

## Library stale logout guard — November 23, 2026

Logout now requires the expected account ID and validates it against the current session cookie before deleting that session. Stale account requests return an error without clearing or revoking the replacement session. API and host regressions cover mismatched identities and valid logout. See `docs/library-account-safety-2026-11-23.md`.

## Library offline startup — November 23, 2026

If the session cannot be checked, the Library leaves account recovery untouched and tells the user to reconnect and retry. A host regression verifies no account snapshot request runs until the owner is confirmed, and retry restores the preserved local edit. Live browser and multi-device behavior remain unverified.

## Library two-tab reconnect check — November 23, 2026

Host regression simulates a second tab committing while the current tab has a local edit. Refocus triggers conflict merge and saves the combined snapshot at the next revision. This is controlled host coverage; live two-tab browser acceptance remains open.

## Local browser account-sync acceptance — November 23, 2026

Two in-app tabs on the local Worker preview shared a disposable test account. A Ledger note saved in one tab appeared in the other after account refresh. Sign-out in one tab returned the other to Guest preview after reload. Temporary account and D1 records were removed; guest data was preserved. Live cross-device acceptance remains open.

## Local account deletion API — November 24, 2026

Added `POST /api/orbit/delete-account` with password re-entry, typed confirmation, rate limiting and transactional removal of account-owned sessions, Journal entries, Library snapshot and account row. The response lists only account-owned data; cookie-owned Alchemy journeys remain outside deletion scope. The Library account menu offers JSON export and an explicit deletion form. Isolated tests cover wrong password, rollback, session invalidation, other-account isolation and preservation of separately owned Alchemy data. See `docs/library-account-safety-2026-11-23.md`. Local only; no push or deployment.

Local browser QA on an isolated D1 confirmed deletion stays disabled until account export, password re-entry and typed `DELETE`. Final deletion was not submitted. Synthetic test account and temporary database were removed after verification.

Deletion copy now explains D1 recovery-history and Worker Logs retention limits. Production plan and dashboard settings remain unverified. See the retention audit and restore checklist gap in `docs/library-account-safety-2026-11-23.md`.

## IO-031 account data sync — November 23, 2026

Added account-owned profile/privacy settings and opt-in sync for local progress, chart inputs, appearance/audio settings and Alchemy records. The account export includes this snapshot, and account deletion removes it. `npm run test:library` and `npm run build` pass. At that checkpoint, conflict UX and live cross-device acceptance remained unfinished. See the later conflict-safety section and `docs/library-account-safety-2026-11-23.md`. Local only; not pushed or deployed.

## IO-031 sync conflict safety — November 24, 2026

Concurrent device edits now merge by record. Same-record conflicts preserve both copies for download; remote privacy opt-out takes priority. Tests cover merge, isolation and opt-out. Live two-device acceptance, email verification/recovery, and production migration remain open. See `docs/library-account-safety-2026-11-23.md`.

Saved profile names now appear in the Soul Hub, and saved avatar choices update the shared identity surfaces. The local browser avatar stays separate unless the user saves an account avatar. Live multi-device acceptance remains open.

Latest acceptance checkpoint: isolated preview on port `4190` was stopped because the browser could not load its page. No test account or user data was created. Resume IO-031 live sync acceptance in a working isolated browser.

## Local IO-031 account acceptance — November 24, 2026

An isolated Worker preview used a fresh temporary D1 database at `http://localhost:4191/library`. A synthetic `.invalid` account registered successfully; the profile name saved, and Journey progress/reflections sync was enabled. Worker logs confirmed account-data `GET` and `PUT` requests returned 200. The Library UI reported the account save. No existing browser profile, production database, push or deployment was used. The preview process was stopped after acceptance.

Signed into the same temporary account from a separate in-app browser context. Profile name and enabled Journey progress/reflections setting restored from account storage. The linked Soul Hub still opened in visitor-preview state and did not show the saved profile name in its visible heading. Treat profile display in the Hub as unverified. This check does not establish separate-device or production acceptance. IO-031 remains Needs verification until account/profile surfaces, cross-device sync and production security gates pass.

Fixed the Soul Hub greeting to treat a saved account profile as personal context. Cross-tab profile updates now refresh the cached identity used by the Hub. Rebuilt and reopened the isolated preview; after account sign-in, the Hub displayed “Welcome home, IO31 Local QA.” The profile and progress/reflections preference also restored in a separate in-app browser context. This verifies local cross-context retrieval, not physical-device or production acceptance. IO-031 remains Needs verification.

Extended local acceptance across two separate browser contexts against the isolated temporary D1. A synthetic progress milestone and explicitly marked test-only reflection restored in the second context; the Soul Hub showed one completed activity. Library reading progress restored as “Continue: Tao Te Ching” and “Resume · Chapter 1.” The Androgynous profile avatar and enabled Avatar/audio sync category also restored. Updated privacy copy to explain browser-local defaults and opt-in account sync. These are simulated browser contexts, not physical-device or production acceptance. IO-031 remains Needs verification.

Initial birth-chart acceptance failed because the typed Denver result was not committed from the suggestions; the date was not the blocker. Selecting Colorado Springs and pressing Enter enabled chart casting.

Fixed birth-chart account sync across the Observatory iframe boundary. The chart now posts validated birth inputs to its same-origin parent; the parent stores them through the account-sync hook, which uploads them only when the birth-chart category is enabled.

Local acceptance passed with a synthetic `.invalid` account in a temporary Worker/D1. After enabling birth-chart sync in the first context, a separate Chrome context restored the 2000-01-01, 12:00 Colorado Springs chart and rendered its computed blueprint. Both sessions signed out, “Forget birth inputs” cleared local chart data, and the temporary D1 was removed. `npm run chart:build`, `npm run test:library`, `npm run build`, JavaScript syntax checks and `git diff --check` passed. This is simulated cross-context coverage, not physical-device or production acceptance. Email verification/recovery, production migration, provider configuration and security sign-off remain open. No push or deployment.


## IO-032 public celestial profile — November 24, 2026

Added private-by-default, opt-in public profile sharing. Users can select display name and/or celestial avatar; public links use random unguessable paths and reveal no account ID, email, birth inputs or charts. Profiles support immediate unpublishing, `noindex,nofollow`, and account export/deletion. Tests cover private defaults, owner isolation, selected fields, avatar-only mode, link revocation and deletion. `npm run test:library` and `npm run build` passed; isolated local browser preview verified publish and revocation. See `docs/library-integration-2026-11-23.md`.

IO-032 remains in progress. Connections, discovery, moderation/blocking, relationship astrology and shared chart views remain unimplemented. Do not treat share links as a moderated social network. Local only; not pushed or deployed.

## IO-032 moderation groundwork — November 24, 2026

Added private profile-report intake API foundation with signed-in reporter check, published-target validation, fixed reason categories, five-report daily limit and reporter anonymization on account deletion. API tests cover authentication, self-report rejection, invalid reasons, rate limiting and report retention after target-account deletion. This is not a finished moderation feature: there is no report form, review queue, decision workflow or account blocking yet. Keep profile sharing local until moderation and blocking acceptance is complete. See `docs/library-integration-2026-11-23.md`.

## Site-wide destination navigation — November 23, 2026

Added persistent bottom navigation to the static Inner Orbit experience and native App Router pages. The visible bar links to Soul Hub, Destinations, Blueprint, Journey and Celestial Library; More opens Connections, Inner Alchemy, Spirit Guides, Stardust & Access, Supporters and privacy information. The fixed bar replaces the prior page-end-only footer, which had been hidden on the static Hub and was easy to miss after long Library pages. Added Library to homepage quick links and the Hub dock; the Explore menu links directly to `/library`. Fixed the directory self-link; its CTA now opens the Celestial Library. Local Worker preview on port `4197` visually confirmed the persistent bar on Soul Hub and Celestial Library, and confirmed More opens secondary destinations. `npm run build` and `git diff --check` passed. The Library account/sync status now sits above the bar. Build retains existing large-chunk and route-classification warnings. Local only; no push or deployment.
