# Native Library integration reconciliation — November 23, 2026

## Source and scope

Main Sites project: `appgprj_6af524465a1081918f14eaccaadd3d95`, current saved version 37. Recovered main source baseline: `22a823639fecfe3a95612963afec407d7c71379b`. Local branch: `codex/library-integration-qa`. No source push, saved Site version, audience change or deployment occurred.

The main source already contained native React Library integration and account-backed persistence, introduced before this pass. Earlier Notion records saying integration was unknown were stale. The verified 136-file recovery remains an immutable comparison source in the separate `library-recovery` checkout; no replacement import was needed.

## Existing integration verified

- `/library` mounts `LibraryHost` and lazy-loaded React Library components directly, not an iframe.
- Homepage discovery and Soul Hub include Library destinations; the Library returns to `/#home`.
- All 51 Library image assets are present under `public/library-assets/images/` and copied into the production build.
- Fourteen books, 262 chapters and 3,788 unique passage IDs match the recovered catalog counts.
- Shared journal/account API and `/api/library` provide account-owned snapshots, compare-and-swap revisions, guest-local records, consent-based legacy import and recovery export. This code and local tests do not prove production or multi-device acceptance.

## Changes in this pass

Extracted pure `navigation.ts` parsing/serialization. Notebook state now participates in URL/history. Closing `?ledger=1` removes it; Back restores it and Forward closes it. Note IDs in journal backlinks initialize the corresponding Ledger note instead of always showing the list. Reader links validate book, chapter and passage membership, preserve/clamp UTF-16 offsets, and discard invalid anchors. Back/Forward clears stale page and overlay state. Explicit passage jumps within a chapter remount the reader. Pending cinematic timers are cancelled on new traversal, reader entry, history changes and unmount.

No data schema, API, migration, artwork or editorial text was changed. Invalid or missing note IDs show the notebook list; no inaccessible note is fetched by its ID alone.

## Verification

- `npm ci --ignore-scripts`: installed 699 locked packages after the packaged installer failed with `EALLOWSCRIPTS` under this host's npm policy. The available platform binaries then built and served the application successfully. No package manifest/lockfile changed.
- `node tests/library-navigation.mjs`: passed 262 chapter/passage/offset/note-link round trips, all room routes, invalid IDs, malformed and excessive offsets, and closed-notebook URL construction.
- `node tests/library-model.mjs`: passed catalog counts, unique passage IDs, independent edits, deletion preservation, conflict rejection and consent-safe legacy migration.
- `node tests/library-api.mjs`: passed actual API handlers against an isolated in-memory SQLite/D1 double: registration, cookie authentication, all Library record types, account isolation, account-switch guard, compare-and-swap conflicts, cross-origin rejection, journal bridge, deletion and logout. No production records were used.
- Focused TypeScript check of `App.tsx`, `Ledger.tsx`, `navigation.ts` and their Library imports passed.
- Full Worker/client build passed. Existing warnings remain for chunks over 500 kB and Vinext route classification.
- Browser: local guest API initialized after applying migrations to the new checkout's empty local D1 emulator only. Notebook deep link opened; closing updated URL; browser Back reopened, Forward closed, and refresh kept it closed. Library-to-Hub return and Hub-to-Library entry worked.
- Built Worker preview: direct Tao chapter 81 link rendered without replaying the cover. Phone viewport 390 × 844 used one leaf; document width was 390 pixels with no horizontal document overflow. Notebook opened and closed in the reader; desktop viewport restored. No error-level console entries were captured in the browser session.

## Known verification limits

The baseline repository-wide `npx tsc --noEmit` reports existing errors outside this change: `public/index.html?raw` lacks a declaration, the Observatory child project has uninstalled separate dependencies, and its Journal JSON values are typed as unknown. These errors were observed before the navigation edits. The focused Library TypeScript check passes; the complete repository typecheck is not claimed to pass.

No physical iPad/Safari, screen-reader audit, hardware GPU profiling, sustained account-switch race tests, live multi-device/offline merge test, full catalog editorial collation or jurisdiction-specific rights clearance was performed. Historical/translation/art rights remain a publication gate. Existing email verification/password recovery gaps remain. Do not mark full IO-020/IO-021/IO-031 or production readiness complete from this pass.

## Local preview

From the main checkout:

```bash
npm run dev -- --host 127.0.0.1 --port 4177
npm run build
npm start -- --port 4178
```

Development: http://127.0.0.1:4177/library . Built Worker: http://127.0.0.1:4178/library . Both use local D1 emulator state and depend on running processes. Local preview is not a new publication. The 4178 Worker preview was used for final reader/phone verification.

## Next checklist step

IO-031: local browser QA confirmed export gating and explicit deletion safeguards. Provider retention audit recommends provider-default D1 history, shortest available Workers Logs retention, no user-content logging, and restore-time deletion reconciliation. Verify production plan/settings and build a tested restore runbook before release. Alchemy journeys and offline caches remain separate from account deletion. Profile, birth-chart, avatar/customization and audio-preference persistence remain open; cross-device acceptance remains open. See `library-account-safety-2026-11-23.md`. No deployment or push.


## IO-032 public profile sharing — November 24, 2026

Implemented an opt-in profile vertical slice. New `public_profiles` D1 table stores selected public display name/avatar, random 256-bit path token, and publish state. Authenticated settings default private and allow field selection. Anonymous route exposes only selected fields, sets no-store headers, and returns the same unavailable response for unknown, private or revoked links. Profile pages request `noindex,nofollow`. Account export includes profile settings; account deletion removes the profile row.

`npm run test:library` passed API coverage for private default, account isolation, unpredictable link, selected name only, empty-publication rejection, avatar-only response, revoked-link 404 and account-deletion cleanup. `npm run build` and `git diff --check` passed. Local Worker/D1 preview on port 4196 verified publishing a name-only profile and then unpublishing it; the public page showed the selected name and then the private/unavailable state. The synthetic `.invalid` account was signed out.

This is one IO-032 checklist item slice, not full IO-032 completion. Remaining work: consent-based connections/discovery, block/report and moderation controls, relationship astrology, validated synastry/composite calculations, shared chart visualizations, milestones/celebrations and end-to-end privacy acceptance. Public sharing has no discovery directory or moderation yet. No production migration, push or deployment occurred.

## IO-032 report-intake checkpoint — November 24, 2026

Added `profile_reports` storage and an authenticated `POST /api/orbit/report-profile` endpoint. Reports accept a published profile slug and one of four fixed reasons; free-text collection is excluded. The endpoint rejects unsigned users, self-reports, invalid slugs/reasons and hidden targets. It limits each account to five reports per day. Reporter identity becomes null if that account is deleted; target report records remain for moderation evidence.

`npm run test:library`, `npm run build` and `git diff --check` passed after applying migration 0005 in the isolated test database. Tests cover auth, self-report rejection, reason validation, daily limit and retaining target reports when profile owner deletes account. Existing build warnings remain for large client chunks and dynamic API route classification; test renderer deprecation notice remains.

This is backend groundwork only. No report form, moderator review queue, decision/appeal workflow or account blocking exists. Do not expose report intake as a reviewed safety feature or publish the current social slice. Next IO-032 subtask: design and implement moderator review and user blocking together, with defined removal/appeal actions and privacy handling. No production migration, push or deployment.

## Site-wide destination navigation follow-up — November 23, 2026

Added site-wide destination navigation to the static experience and shared `SiteFooter` to native routes (`/library`, `/alchemy`, `/profile`). Expanded homepage navigation with a Library top-level link, homepage destination-band option and Library discovery card. Added a direct Library link to the Soul Hub dock and made the Explore menu Library item use `/library`. Fixed the directory’s self-referential “Explore every destination” action; it now offers “Open the Celestial Library.”

The first footer implementation used page-end placement and was hidden on the static Hub. It was difficult to find after long pages. Replaced it with a persistent bottom navigation bar on static and native routes. The bar shows Soul Hub, Destinations, Blueprint, Journey and Celestial Library. “More” opens Connections, Inner Alchemy, Spirit Guides, Stardust & Access, Supporters and privacy information. The Library account/sync status sits above the bar.

Local Worker preview on `http://127.0.0.1:4197` visually confirmed the persistent bar on the Soul Hub and Library route; the More menu exposed secondary destinations. The Hub and Library links are present in the visible bar. `npm run build` and `git diff --check` passed. Build retains existing large-chunk and route-classification warnings. No production change, push or deployment.
