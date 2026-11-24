# Inner Orbit Phase 3.3 · capability groundwork

Status is based on the existing source and bounded Observatory verification, not a public-launch certification. Complexity is a rough engineering estimate, excluding content licensing and a full QA programme: S = days; M = 1–3 weeks; L = 1–2 months; XL = multiple months. These are planning estimates, not delivery promises.

| Capability category | Inner Orbit status after this pass | Missing dependency / boundary | Priority / complexity |
|---|---|---|---|
| Natal and event calculations | Natal functional: ten bodies, tropical/geocentric, resolved city and historical UTC. A transit moment is calculated; no separate event-chart workflow. | Event input workflow; broader date/time validation. Existing Astronomy Engine retained. | P1 / S–M |
| Houses and customization | Whole Sign / Equal House; ASC / MC below 66° absolute latitude. Functional display filters, degrees and body visibility. | Validated Placidus / quadrant algorithms, polar failure policy; nodes and other points. | P1 / M–L |
| Wheels and technical analysis | Interactive natal wheel, selected aspects and houses, sticky desktop instrument, mobile viewer, position tables, aspect matrix; real transit biwheel. | More complex collision avoidance; extra points, layouts and configurable point-specific orbs. | P1 / M |
| Relationship charts | Fictional relationship demonstration exists; no calculated two-person synastry or composite. | Second independently resolved chart; cross-chart model and consent; validated midpoint/Davison conventions. | P1 / M–L |
| Timing: transits, progressions, directions, returns, profections | Real UTC transit snapshot and natal overlay functional. Separate Celestial Clock still contains explicitly simulated movements. | Exact-event root finding, time standards, method-specific calculation engines and reference fixtures. | P1 transits/returns, P2 other methods / M–XL |
| Maps, relocation and local space | Absent. | Equatorial/horizon coordinates, geospatial curves, map rendering/data licensing and relocated-angle fixtures. | P3 / XL |
| Asteroids, stars, Lots, nodes and additional points | Absent; no substitute points fabricated. | Licensed/open ephemerides, star catalogues/proper motion; mean/true node and day/night Lot conventions. | P2 / M–L |
| Patterns, dignities, rulers and dispositors | Element/modality counts and actual traditional house-ruler placement available. No full dignity, pattern or dispositor analysis. | Named schemes, sect and bounds tables; pattern criteria and reference cases. | P2 / M–L |
| Midpoints, harmonics and traditional methods | Absent beyond traditional house-ruler mapping. | Wrap-safe midpoint conventions; transforms, timing keys and validation datasets. | P3 / M–L |
| Sidereal / Vedic | Absent. | Ayanamsha models, reference epoch/precession tests, method-specific houses, vargas and interpretation expertise. | P3 / L–XL |
| Ephemerides, calendars, timing search and research | Position function and snapshot comparison reusable; no calendars, event search or collection research. | Worker/job scheduling, exact-event algorithms, queryable chart corpus and timezone-aware output. | P2 / L |
| Saved charts, comparisons, exports and reports | Single opt-in browser-local saved input supported; full report and browser print action; versioned JSON download added. No account library or cloud sync. | Chart collection IDs/index and migration; authenticated ownership; image/vector export and separately verified PDF output. | P1 local collection, P2 cloud / M–L |

## Sources and access limits

Official Solar Fire X documentation was accessible: charting https://sfx.alabe.com/features/charting/ ; forecasting https://sfx.alabe.com/features/forecasting/ ; reports https://sfx.alabe.com/features/reports/ ; maps https://sfx.alabe.com/features/maps/ ; feature overview https://sfx.alabe.com/features/ . It documents broad calculated chart families, multiwheels and specialist workflows, timing, locality work and report output. This table groups those capabilities without copying report text, artwork or designs.

Astro-Seek's main site returned 403 to web retrieval; the earlier browser attempt also showed an explicit Cloudflare access block. Its accessible official French daily-horoscope page https://fr.astro-seek.com/horoscope-du-jour-gratuit documents moving planetary positions and natal transits. Broader Astro-Seek catalogue parity is **not verified here**; the remaining categories are a target from the founder's brief and corroborated Solar Fire documentation, not an assertion of having inspected every Astro-Seek calculator. No bypass was attempted.

## Shared calculation boundary

`dist/chart-model.js` exports schema `inner-orbit.chart`, version 1. It captures original birth inputs and resolved UTC/location; engine/version and accuracy; zodiac, houses and aspect options; ten stable body IDs with longitude/latitude/speed; ASC/MC and cusps; calculated aspects; supported points and explicit uncertainty. The adapter does not alter the existing runtime chart or replace saved birth-input records. Future chart layers should reference independent instances of this schema and declare kind, epoch, origin-chart IDs and technique settings. Transit snapshots already have their own UTC/positions. Synastry uses two independently calculated models; composites need a declared derivation; progressions/returns need dated provenance; mapping needs coordinates and horizon transforms; extra bodies need new point IDs and ephemeris provenance.

Future browser-local collection design: a versioned index of stable chart IDs, a private optional display label, input record, preferred view and created/updated times. Keep collections separate from calculation caches; migrate single-input legacy saves only with explicit user action. Cloud ownership must remain a separate account-backed implementation. Suitable exports: schema JSON (working); browser print report (existing, final pagination unverified); future SVG/PNG wheel and dedicated PDF render. Do not expose unsupported export buttons.

## Next three bounded batches

1. **Calculation coverage and fixtures:** validated Placidus plus polar limits; mean/true node support with reference cases; point-specific orbs. Highest dependency for professional trust. M–L.
2. **Real two-chart workflows:** browser-local chart collection, restore/import versioned inputs, calculated synastry biwheel and cross-aspect readings. Reuse schema v1 and the transit-layer renderer; requires consent and chart ownership design. M–L.
3. **Timing engine:** exact transit contacts and ingresses, then solar/lunar returns and a calendar. Requires bracketed root-finding, time/uncertainty handling and regression fixtures before interpretation. L.

No further batch is started by Phase 3.3.
