# Library account-switch and failed-save safety

Date: November 23, 2026. First immediate scheduled work cycle. Checklist: IO-031, “Connect account persistence, Ledger and Soul Journal.” Prior local checkpoint: `7aee4949c86e90cf1fa1cf40c199d8285baeccf7`; branch remains `codex/library-integration-qa`.

## Reproduced defect

The old `boot` path checked its generation after loading the session, but not after loading the Library snapshot. Starting A, finishing B first and then completing A caused A's snapshot to replace B's state. Because persistence uses the current owner key, the older snapshot could also be written to B's local recovery cache. The new real-host regression failed before the fix with “Late A response replaced B state.” Tests use synthetic accounts, in-memory storage and controlled responses, not production data.

## Changes

- Ignore obsolete snapshot loads, background checks and errors after any account-generation change or unmount.
- Scope the in-flight write marker to its originating generation. An old write cannot block a newer account or release that account's pending-write lock.
- Bind adapter load/save closures to the host generation; reject access after invalidation.
- Capture the persistence adapter once per mounted reader in `useLibraryStore`. Old effects no longer discover and save through a later account's module-global adapter.
- Add `npm run test:library` and real React hook regression coverage. No authentication protocol, account schema, endpoint, migration, stored record format, artwork or editorial text changed.

## Verification

`npm run test:library` includes:

1. Model: catalog uniqueness, three-way merge, deletion, conflict rejection and consent-safe migration.
2. API: actual handler code against isolated SQLite/D1 doubles, including authentication, isolation, stale revision, cross-origin rejection, journal bridge and logout.
3. Navigation: 262 chapter/passage/offset/note-link round trips and invalid URL handling.
4. Host/store races: delayed account A success after B loads; delayed A failure after B succeeds; overlapping A/B writes; no stale unlock or duplicate B write; invalidated adapter rejection; failed PUT retains dirty local recovery; retry advances revision and clears dirty state; a mounted A reader cannot save through B's replacement adapter.

The original overwrite regression failed before the host fix and passed after it. The complete bounded suite, focused Library TypeScript check and Worker/client build passed after changes. Existing large-chunk and Vinext route-classification warnings remain. Full repository TypeScript baseline errors from the previous report remain outside this change.

`react-test-renderer` 19.2.6 is a development-only dependency matching React 19.2.6. Its upstream deprecation warning is visible in test output. The harness tests hooks without a browser; only the expensive reading surface is stubbed. Future test infrastructure should migrate from this deprecated renderer. No production/local personal browser data is used, and no test accounts are registered in a running service.

## Limits after first cycle

No claim of complete account security or live cross-device reliability. Browser storage quota failures, offline startup without a confirmed session, session changes during logout, network reconnection across multiple tabs, physical Safari, accessibility and GPU lifecycle need additional acceptance work. Existing auth features lack email verification/password recovery. No new browser QA was run for this logic-only patch; previous visual evidence remains in the integration report.

Changes remain local. No source push, publication, production database migration or production record access occurred. See the Notion account-persistence task and dated handoff for cycle evidence.

React's guidance on ignoring stale asynchronous results: https://react.dev/reference/react/useEffect#fetching-data-with-effects .

## Immediate second cycle — logout and storage failure

The earlier checklist recorded logout races and quota failures as open. Review found that the sign-out button awaited `sync()`, but `sync()` returned immediately when another write was already active. It could revoke the session before that write finished. Review also found that `localStorage.setItem()` quota errors escaped the adapter before account sync was scheduled.

Changed sync to share its in-flight promise within the current account generation. Sign-out now waits for the active save, refuses to revoke the session while local changes remain dirty, and remains disabled during the operation. Browser cache write failure now leaves the in-memory snapshot available and still schedules account sync; status reports when browser recovery could not be saved. Guest-only writes report that export is needed before leaving.

Added host regression cases for a simulated storage quota exception, sign-out during a deferred account save, and failed-save sign-out refusal. All passed with `npm run test:library`, along with prior account race, API, model, migration and navigation coverage. Focused Library TypeScript, Worker/client build and `git diff --check` passed. The tests confirm revocation starts only after a pending save succeeds and remains blocked after a failed save. No browser interaction is claimed for this logic-only change.

Browser `Storage.setItem()` can throw `QuotaExceededError` when storage capacity is exhausted; the code now handles failed cache writes without suppressing the independent account save. Reference: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem .

Remaining: offline startup without a confirmed session, multi-tab reconnection, live cross-device acceptance, physical Safari, accessibility, GPU lifecycle and editorial rights. No push, publication, production data access or deployment.

## Immediate third cycle — bind logout to the current account

The previous cycle guarded the client save flow but left the logout endpoint willing to revoke whichever session cookie arrived. A stale tab could submit an old account's logout after the cookie changed to another signed-in account.

Logout now requires the client to send its expected account ID. The server compares it with the identity resolved from the current HttpOnly session cookie before deleting that exact token/account pair. Missing identity returns 400; missing session returns 401; mismatch returns 409 without deleting a session or clearing the cookie. On 401/409, the client reloads current session state. Cloudflare Workers treats incoming cookies as request headers; the server continues to resolve identity from the HttpOnly cookie and uses the body only as a stale-operation guard. Reference: https://developers.cloudflare.com/workers/runtime-apis/request/ .

API regression uses two synthetic accounts, sends A's valid cookie with B's expected ID, verifies 409 and no `Set-Cookie`, confirms A remains signed in, then verifies A's matching logout succeeds. Host regression verifies the expected identity is sent after the pending save completes. `npm run test:library`, focused Library TypeScript, Worker/client build and `git diff --check` passed. Existing renderer deprecation, chunk-size and Vinext route-classification warnings remain.

Live cross-device/logout concurrency remains unverified. Offline startup, multi-tab reconnection, physical Safari, accessibility, GPU lifecycle and editorial rights remain open. No push, publication, production account access or deployment.

## Immediate fourth cycle — preserve recovery during offline startup

The next IO-031 acceptance gap was startup without a reachable session endpoint. The host intentionally avoids anonymous fallback because it cannot confirm which account owns the cached records. The error view only showed the raw network error, so users had no clear confirmation that local recovery remained untouched.

Changed boot failure status to state that local account recovery was left untouched and offer retry when connection returns. Added a real-host regression with a synthetic dirty account cache and rejected session request. It verifies no Library API request runs before session confirmation, the cached bytes remain unchanged, and retry restores the local note only after that account session succeeds.

`npm run test:library`, focused Library TypeScript, Worker/client build and `git diff --check` passed. This is a controlled hook test, not live browser or device acceptance. Multi-tab reconnection and live cross-device synchronization remain open, along with physical Safari, accessibility, GPU lifecycle and editorial review. No production data or services were accessed.

## Immediate fifth cycle — two-tab reconnect acceptance

Added a host-level multi-tab simulation using a synthetic shared account snapshot. One tab makes a local edit while an external tab advances the server revision. On focus, the Library receives a compare-and-swap conflict, merges independent local/remote notes, retries the latest revision and clears its dirty state only after the simulated save succeeds.

The focused test passed, then the full `npm run test:library` suite, focused Library TypeScript and `git diff --check` passed. This verifies the existing focus/revision-conflict path under controlled requests; it does not replace a real two-tab browser or live cross-device test. Those remain open, as do physical Safari, accessibility, GPU lifecycle and editorial review.

## Local browser acceptance — two-tab account sync

Used the existing local Worker preview at `http://127.0.0.1:4178/library` with two new in-app browser tabs. The local D1 started empty. Created a disposable account using an `.invalid` email, confirmed both tabs shared that account session, and created a synthetic Inner Ledger note in tab one. Tab two showed the note after its account refresh cycle. Signing out in tab one and reloading tab two returned it to Guest preview. No real account credentials or production records were used.

Removed the temporary account, session, Library snapshot, journal rows and login-attempt row from the local D1; all five tables returned to zero rows. Existing guest library data remained intact. This proves same-browser local preview behavior only; live cross-device, real account and physical-browser acceptance remain open.

## Account coverage audit — IO-031

Reviewed the account, Library, journal and Alchemy journey handlers and D1 schema. Account registration and login use `accounts` and `sessions`; journal entries are account-owned; one Library snapshot stores highlights, Ledger notes, bookmarks, reading progress, reader preferences and recent items. The Library snapshot is keyed to the authenticated account and uses revision checks. Alchemy journeys use a separate long-lived browser cookie, not the account session.

Account-wide deletion is absent: the account API deletes individual journal entries and the current session only. No endpoint removes the account, all sessions, journal entries, Library snapshot and related data together. Profile, birth-chart, avatar and audio-preference persistence also have no corresponding account-backed records in this schema/API. The IO-031 checklist keeps data deletion/security, profile, chart, avatar/customization and audio preferences open. This is a source/schema audit, not an authorization or legal-compliance review.

## Account deletion behavior proposal — IO-031

Deletion requires an active account session, password re-entry, and a typed `DELETE` confirmation after showing the exact scope. The confirmation must offer account-data export first. On confirmation, one database transaction removes that account's sessions, journal entries, Library snapshot and account row; it then clears the current session cookie. Another account and shared login-rate-limit records remain untouched. A failed transaction must leave the account usable and report failure.

The current `io_alchemy` journey cookie identifies data independently from the account. Account deletion cannot locate journeys saved under that cookie or on another browser. The deletion flow must name this limitation and direct users to Alchemy's existing “Erase my Work” control for the current browser, or the product must link journey ownership before claiming full account erasure. Guest local recovery also lives in browser storage and cannot be removed by the server; the flow must explain that distinction and avoid silently clearing it. Retention of backups and operational logs needs an explicit policy before release; this code audit does not establish one.

## Local API implementation — IO-031

Added `POST /api/orbit/delete-account`. It requires the current authenticated account, a password re-entry and exact `DELETE` confirmation. Failed attempts use a 15-minute IP-hashed rate limit. One D1 batch removes all account sessions, Journal entries, Library snapshot and account row; success clears the current session cookie. Shared attempt records, another account, separately cookie-owned Alchemy journeys and browser-local guest recovery remain untouched. At this API-only checkpoint, the user-facing confirmation screen was not yet built; the next section records it.

Expanded the isolated API suite to verify confirmation and password failures preserve data, a simulated mid-batch database failure rolls every deletion back, successful deletion removes all account-owned rows, invalidates the session and preserves account B. `node tests/library-api.mjs`, `npm run test:library`, `npm run build` and `git diff --check` passed. Build retains existing large-chunk and route-classification warnings. D1 batch transaction behavior follows Cloudflare's documented contract: [D1 batch](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch).

Remaining gates at API stage: user-facing flow, Alchemy/guest-data scope, and backup/log retention. IO-031 remains open; no production data accessed, no push or deployment.

## Local confirmation and export flow — November 24, 2026

Added a Delete account section to the Library account menu. It explains which server records deletion removes and which separate Alchemy and guest/offline records remain, and links users to Alchemy's existing “Erase my Work” control. The form requires a successful account export, password re-entry and exact `DELETE` text. Export packages the current server Journal and Library data plus this browser's account recovery cache. The reader becomes inert while export or deletion runs; deletion syncs pending Library edits first and refuses to proceed if they remain dirty. After server confirmation, this browser's account cache is removed and the user returns to Guest preview. Export does not include separately cookie-owned Alchemy journeys or offline recovery copies on other devices.

`npm run test:library`, `npm run build` and `git diff --check` passed. Build retains existing large-chunk and route-classification warnings. This is local implementation evidence only. The separate Alchemy erase control remains user-managed; backup/log retention remains undefined. IO-031 and full account-erasure acceptance remain open. No push, deployment or production data access.

Local browser QA used an isolated Worker preview at `http://127.0.0.1:4180/library` with its own temporary D1 directory. A synthetic `.invalid` account reached the Delete account panel. The delete control stayed disabled before export, then enabled only after the JSON export completed, password was re-entered and `DELETE` was typed. The scope warning appeared in the accessibility tree. Final deletion was not submitted; the temporary D1 state and synthetic account were moved to Trash after QA. This verifies the flow and safeguards without deleting an account through the product UI.

The host did not expose the downloaded JSON file for independent content inspection. Tests and build passed after the final UI copy change.

## Provider backup and log retention audit — November 24, 2026

Cloudflare D1 Time Travel is always on for databases using its production storage subsystem. Official documentation lists up to 7 days of recovery history on Workers Free and 30 days on Workers Paid, with no additional charge for D1 history or restores. Worker Logs documents a 7-day maximum; its plan-specific table lists 3 days on Free and 7 days on Paid as of this audit. The platform has announced a Workers Logs pricing change for December 1, 2026. Sources: [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) and [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).

Source audit found no `console.*` logging in the account, Journal, Library or Alchemy API handlers, and no app-managed R2 backup/export pipeline in tracked source. Production account plan, D1 storage version, logging settings and any dashboard-configured export are not available in this checkout. Do not promise immediate full erasure: account deletion removes active rows, but recovery history may retain older copies. Restoring a pre-deletion D1 point could restore deleted accounts; no durable deletion registry or post-restore reconciliation runbook exists yet.

Proposed release policy: keep only provider-default D1 recovery history; do not add longer-lived app backups until purpose, access and expiry are documented. Keep Workers Logs at the provider's shortest available retention and never log Journal answers, passwords, Library notes or export contents. Tell users active data is removed immediately, provider copies can persist up to the verified plan window, and platform logs can retain request telemetry. Before release, verify production settings and plan, confirm actual retention periods, and add a tested restore checklist that reapplies deletions before traffic resumes. These are engineering recommendations, not verified production settings or legal advice.

## Local account data persistence — IO-031

Added the account-owned `account_data` record and migration `0003_pretty_swordsman.sql`. The authenticated API supports private reads, revision-checked writes, bounded key and payload validation, per-category opt-in, and account deletion. Settings in the Library let users save a profile name and avatar form, and enable sync for progress/reflections, chart inputs, appearance/audio settings, and Alchemy. Enabling a category copies matching values from this browser into the account; disabling it removes account copies and retains this browser's local files. The export now includes the account-data snapshot. A same-origin client bridge hydrates missing local keys and mirrors later writes on main, Library and Alchemy routes.

Extended the isolated API suite to apply migrations through `0003`, test account-data isolation, opt-in enforcement, stale revision rejection and deletion rollback/removal. `npm run test:library`, `npm run build` and `git diff --check` passed. The build still reports the existing large-chunk and route-classification warnings.

IO-031 remains open. Registration uses email and password but has no email verification or password recovery. Cross-device reconciliation for these new localStorage records does not yet merge conflicting edits or report sync failures in the affected feature, and no real two-device browser acceptance was run. Alchemy's own server journey remains owned by its anonymous browser cookie; its account-data copy can sync only when opt-in is enabled and the browser bridge sees the local record. Profile/avatar fields are stored in account settings but are not yet wired to every profile surface. Production migration, provider configuration, security review and live account acceptance remain outstanding. No production data, push or deployment used.

## Account sync conflict preservation — November 24, 2026

Added three-way account-data merging for stale device writes. Independent record edits merge; concurrent edits to one record keep the local value and preserve both versions as private conflict copies. Startup also detects a local value that differs from the account copy. Users can download conflict copies from Library account settings, then clear reviewed copies. Turning a privacy category off removes its account records and conflict copies while retaining local browser files. Remote opt-out wins over stale device writes.

Added focused merge tests for same-record conflicts, independent records and privacy opt-out. API tests validate allowed conflict copies, reject invalid sources and reject records for disabled categories. `npm run test:library`, `npm run build`, module syntax checks and `git diff --check` pass. Build retains prior large-chunk and dynamic-route-classification warnings.

IO-031 remains open. No live two-device browser check was run for these new records. Email verification and password recovery remain absent; profile/avatar settings still need full feature wiring; production migration and security review remain outstanding. No push or deployment.

## Saved profile wiring — November 24, 2026

Connected the account profile name to the Soul Hub's name field and saved avatar choice to the shared celestial identity surfaces. Choosing “Use this browser's avatar” leaves account avatar unset and preserves that browser's local selection. Saving a profile updates the local display copy; other open app tabs refresh their Hub name and avatar from storage events. Profile defaults no longer impose an avatar on existing local users.

Extended API coverage for nullable avatar defaults and saved name/avatar round trips. `npm run test:library`, `npm run build`, module syntax checks and `git diff --check` pass. Live multi-device behavior remains unverified. Email verification/recovery and production migration remain open; no push or deployment.

## Live account-sync preview checkpoint — November 24, 2026

Prepared a new local Worker preview on port `4190` with a separate temporary D1 directory. Browser control failed before the page loaded, so no synthetic account or profile data was created. The preview process was stopped. Resume this same IO-031 subtask next: run the profile and opt-in sync acceptance in a working isolated browser, including separate browser storage contexts if available. Keep the acceptance local and preserve all existing browser tabs and stored data.

## Local account profile and opt-in acceptance — November 24, 2026

Created a synthetic `.invalid` account in a fresh temporary D1 database on the isolated Worker preview at `http://localhost:4191/library`. Saved a profile name and enabled Journey progress/reflections sync. The UI confirmed the save; Worker logs showed account-data `GET` and `PUT` responses of 200. The preview process was stopped. Existing browser profiles and production data were not used.

Opened the Soul Hub on the same isolated origin. It remained in visitor-preview state and did not display the saved profile name in the visible heading. This does not prove account data was lost, but profile presentation remains unverified. No separate device storage context was tested. IO-031 remains Needs verification pending end-to-end profile presentation, true cross-device acceptance, email verification/recovery, production migration review and security sign-off.

Signed into the same temporary account through a separate in-app browser context. The profile name and enabled Journey progress/reflections setting restored from account storage, confirming cross-context account retrieval. The Soul Hub still showed its visitor-preview state and did not display the saved name. This is not physical-device or production acceptance.

`npm run test:library`, `npm run build` and `git diff --check` passed after this acceptance. Build retains the existing large-chunk and dynamic-route-classification warnings; the test renderer emits its upstream deprecation notice.

## Soul Hub account profile follow-up — November 24, 2026

The Hub's `hasPersonalContext()` check ignored saved account identity, so a valid account still saw “Your universe awaits.” Updated it to recognize the saved profile and updated cross-tab storage handling to refresh the profile cache before rendering. Versioned the changed script URLs to avoid stale browser assets.

Rebuilt the local Worker preview against the same isolated temporary D1. After sign-in, the Hub displayed “Welcome home, IO31 Local QA.” A separate in-app browser context had already restored that account's profile and enabled progress/reflections preference. `npm run test:library`, `npm run build`, JavaScript syntax checks and `git diff --check` passed. Existing build warnings and the upstream test-renderer deprecation remain.

This is local simulated context coverage, not physical-device or production acceptance. IO-031 remains Needs verification pending true device testing, account email verification/recovery, production migration review, provider configuration and security sign-off. The preview process was stopped; no production data, push or deployment used.

## Cross-context progress, Library and profile acceptance — November 24, 2026

Used the synthetic account on two separate browser contexts against the same isolated local Worker/D1. In the first context, saved a clearly labeled test-only reflection, marked one growth milestone, read Tao Te Ching chapter 1, saved an Androgynous avatar and enabled Avatar/audio sync. In the second context, the Soul Hub showed the saved name and one completed milestone; the journey restored the test-only reflection; Library showed “Continue: Tao Te Ching” and “Resume · Chapter 1”; account settings restored the Androgynous avatar and enabled preference. No real personal data was used.

Updated journey and privacy-dialog copy: browser storage is the default; selected categories sync only after the user enables them in Library settings; disabling a category removes its account copy and preserves the local copy. Local browser accessibility checks confirmed the copy and restored state. `npm run test:library`, `npm run build`, JavaScript syntax checks and `git diff --check` passed. Build retains existing large-chunk and dynamic-route-classification warnings; tests retain the upstream renderer deprecation notice.

These browser contexts share the local emulator and do not establish physical-device or production acceptance. Email verification/recovery, production migration, provider configuration and security sign-off remain open. The Worker preview was stopped. IO-031 remains Needs verification. No push or deployment.

## Birth-chart sync acceptance checkpoint — November 24, 2026

Tried the next IO-031 acceptance gap with the synthetic account in the isolated local preview. The chart form accepted a city suggestion and a synthetic date, but “Begin the casting” remained disabled; toggling exact-time mode also left the form unable to proceed. No chart was created, transmitted or synced. Resume by inspecting the form’s validation and controlled input state, then verify chart restore across the two isolated browser contexts. IO-031 remains Needs verification. No production data, push or deployment used.

Correction — the earlier UI attempt had typed “Denver, USA” without committing a matching city suggestion. This left the selected city null; changing the date was not the cause. Selecting Colorado Springs from the list and pressing Enter enabled casting.

## Birth-chart account sync bridge — November 24, 2026

Found that the Observatory saves birth inputs inside its iframe, while account sync hooks the parent window’s storage methods. Added a same-origin, frame-source-checked message carrying the already validated chart input to the parent. The parent validates field types and coordinate ranges before saving `inner-orbit:imported-birth:v1`; the account-sync hook then stores it only when Birth chart and numerology inputs sync is enabled. The Observatory still saves its browser-local copy.

Built and tested against a fresh temporary Worker/D1. Cast synthetic chart “IO31 Local QA” for 2000-01-01 at 12:00 in Colorado Springs, enabled birth-chart sync, then signed into the same account in a separate Chrome context. The second context automatically restored and computed the chart, including the saved name, date, time and location. Signed out in both contexts, used “Forget birth inputs” to clear local chart copies, and removed the temporary D1. No real birth data or production records were used.

`npm run chart:build`, `npm run test:library` and `npm run build` passed. `node --check public/observatory-integration.js` and `git diff --check` passed after removing one pre-existing trailing-whitespace-only line exposed by the source edit. The Observatory build notes the existing `/birth-city.js` non-module script warning. The main build retains its large-chunk and dynamic-route-classification warnings; tests retain the upstream renderer deprecation notice.

This verifies simulated browser-context sync only. Physical-device acceptance, account email verification/recovery, production migration, provider configuration and security sign-off remain open. IO-031 remains Needs verification. No push or deployment.

## Alchemy journey account-sync acceptance — November 24, 2026

Found a restore race between the shared account-sync bridge and Alchemy’s mounted journey hook. The bridge restored an opted-in localStorage record without notifying feature hooks, so an already-mounted Alchemy view could stay on its empty intake. Added an `io-account-data-hydrated` event with restored key names; Alchemy now adopts its account-restored journey unless the visitor already made a local edit. Versioned the bridge URL in Next and the static entry page.

Tested with a synthetic `.invalid` account in a fresh local Worker and D1 on port `4195`. Enabled Alchemy journey sync, started a test-only Great Work, and saved a synthetic stage response. A separate Chrome storage context signed into the same account and restored the named lead, selected catalyst, desired quality, active Calcination stage and reflection. Initial paint showed empty intake briefly; after account hydration, the saved stage and response appeared. Both browser copies were erased, the synthetic account was deleted through its account controls, and local D1 counts confirmed zero accounts, account snapshots and Alchemy journeys. The temporary D1 directory was removed and Worker stopped.

`npm run test:library`, `node tests/alchemy-api.mjs`, `node --input-type=module --check < public/account-sync.js`, `npm run build` and `git diff --check` passed. The build retains the existing large-chunk and dynamic-route-classification warnings; test output retains the upstream `react-test-renderer` deprecation notice.

This verifies simulated browser-context sync only. Physical-device acceptance, account email verification/recovery, production migration, provider configuration and security sign-off remain open. IO-031 remains Needs verification. No push or deployment used.

## IO-031 deletion-scope response consistency — November 24, 2026

Code review found the account-deletion API removed Alchemy journeys only when their cookie-derived owner hash matched an account UUID, which is not the Alchemy route’s ownership model. The response also claimed Alchemy data was deleted despite that mismatch. Removed the ineffective query and removed Alchemy from the API’s deleted-data list; account deletion preserves cookie-owned journeys as the UI already discloses.

Updated API regression coverage with a separate synthetic cookie owner. The test confirms account deletion removes account-owned rows while preserving that journey and reports only account-owned deletion categories. `npm run test:library`, `npm run build` and `git diff --check` passed. IO-031 remains Needs verification; physical-device acceptance, email verification/recovery, production configuration and security review remain open. No push or deployment.
