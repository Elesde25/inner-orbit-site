# Inner Orbit — Living 3D Natal Chart (Discovery Revision)

Standalone runnable prototype. `npm install` → `npm run dev` → open the printed URL. Production build: `npm run build` (emits `dist/index.html`).

## What changed (changelog)

**Preserved foundation** — Three.js renderer and gold-and-ink design kept as-is: animated planet orbs with glyph labels, gold wheel with Placidus cusps + ASC/MC markers, layered starfields, casting sequence, planet rail, hover tooltips, mobile chips, reduced-motion and resize handling.

**Renderer upgrades (`src/lib/scene.ts`)**
- Solid neon aspect beams with restrained glow: white-hot core + tinted body + faint halo (tubes, not dotted/dashed lines; no bloom pass, opacity capped).
- Routed vs Exact connection modes (gentle center-bowed curves vs straight chords), switchable live.
- Clickable beams (fat invisible pick-tubes) → aspect selection synced with panel, explorer, and 2D view.
- Restrained illuminated pulse travelling the selected connection.
- Saturn's ring system; Fibonacci golden-spiral galactic core; violet + blue nebula clouds; golden atmospheric particles.
- Atmosphere modes Full / Subtle / Minimal; quality Saver toggle; Motion Full/Calm (plus `prefers-reduced-motion` default).
- Guided spotlight: `setSpotlight(planets, aspects)` dims non-relevant elements without hiding context.

**New architecture**
- `src/lib/model.ts` — normalized chart model: elements, modalities, separations, concentrations (rule: 3+ of 10 share a sign/house), noteworthy aspects, Big Three, transparent Patterns builder, chart validator, selection + history types. Single source of truth.
- `src/lib/content.ts` — interpretation library, fully separate from renderer: planet/sign/house/aspect entries, Discover vs Explore-in-Depth builders, 13-term glossary content, 8-step tour content.
- `src/lib/samples.ts` — three demonstration charts (Maya, Theo, June) computed through the same pipeline, clearly badged DEMO.
- `src/components/Chart2D.tsx` — conventional SVG wheel (Aries left, counter-clockwise), synced selection.
- `src/components/reading.tsx` — numbered-card readings, depth toggle, glossary tooltips with actual values, selection history bar.
- `src/components/explore.tsx` — Cosmic Blueprint, Aspect Explorer + filters, collapsible five-aspect guide with real examples, Patterns & Connections, guided-tour panel.
- `src/App.tsx` — one selection state drives 3D, 2D, panel, and explorer; keyboard (←/→/Esc), focus management, persisted prefs + tour completion.

## Interpretation architecture

`astro.ts` (calculation) → `model.ts` (normalization: counts, separations, rule-checked patterns) → `content.ts` (symbolic language) → components (presentation). The renderer never interprets; interpretations never compute. Planet readings compose Planet + Sign + House + synthesis + actual aspects + reflection. Aspect readings show nominal vs measured angle + orb before any symbolism. Discover = warm plain-English; Depth = traditional terms, geometry, distinctions — different content, not different lengths.

## Restore-the-Magic revision (atmosphere, chart, visuals)

B's interface, layout, typography, tour, readings, explorer, calculations, and accessibility are untouched. All changes are in `src/lib/scene.ts`, three layout/framing lines in `src/App.tsx`, and the `.space-bg` backdrop in `src/index.css`. No chart data, positions, or aspect geometry were altered — decorative animation never touches ephemeris output.

**Atmosphere**
- Procedural fbm-noise nebula textures (violet, indigo, cobalt-blue, muted magenta) replace flat radial gradients: 16 depth-layered clouds across far/mid/near shells for real parallax, dark-pocket clouds (normal blending) for contrast, and two luminous cores. Each cloud drifts and swirls individually, slowly.
- Bright-star layer (150 points) + 15 twinkling haloed stars; near-field gold/violet stardust layer with the strongest parallax.
- Full / Subtle / Minimal keep their meanings: Full = everything alive; Subtle = nebulae at 40%, dust halved, near-field off; Minimal = static, nebulae/dust/halos off, stars dimmed. Adaptive FPS monitor steps Full→Subtle→Minimal automatically on struggling devices and reports back so the Display popover stays in sync; manual choices calm the monitor.

**Chart presence**
- Cinematic three-point lighting (warm gold key, violet rim, gold underlight) + lit materials: metallic-gold rims (metalness 0.88) and procedural planet surfaces (Jupiter/Saturn bands, Martian cap, lunar maria, solar granulation, ice-giant wisps) with axial tilt and gas-giant spin.
- Engraved wheel face: guilloche turns, brushed-metal outer band, radial hairlines, etched star-dust.
- Faint gold-violet aura sprite breathing behind the wheel, distinct from nebulae.
- Selection focus ping (expanding gold ring) in addition to the existing halo + pulse.

**Aspect beams** — preserved exactly: solid neon tubes, white crisp core, restrained halo, five distinct colors, no dashes/dots. Selected beams brighten; others recede (existing spotlight).

**Responsive** — `notifyLayout` shifts the principal point into the visible central gap and dollies out just enough to keep the full rim visible; applied before the intro camera move and on resize. Side panels narrow in the 768–1280px range (rail 184px, panel 320px); mobile lifts the chart above the bottom sheet. No horizontal overflow; no UI reorganization.

## Usability revision (mobile sheet, birthplace search, selection emphasis)

**Mobile chart visibility** — The reading panel is now a collapsible bottom sheet on small screens: collapsed to a 56px peek bar (grabber + live selection summary + 2D/Display shortcuts) by default so the wheel stays fully visible; expands to 72vh on demand. Selecting a planet, stepping the tour, or tapping the handle opens it; planet chips restack above the peek bar; the floating control row moves to desktop-only with all functions preserved (2D + Display in the handle, Re-center added to the Display popover). Camera lift adapts to sheet state.

**Birthplace entry** — The 30-city dropdown is replaced by type-ahead search over a new offline gazetteer (`src/lib/cities.ts`, 327 cities with coordinates + IANA timezones): prefix → word-start → substring → country ranking, diacritic-insensitive, keyboard navigable, popular hubs on empty focus. Coordinates + timezone derive automatically and are shown as a confirmation chip. Manual lat/lon/UTC-offset entry remains as an explicit second option, never a fallback.

**Selection emphasis** — Clicking/tapping a planet now grows it to 1.9× with a brighter halo (hover 1.35×) in 3D, and enlarges its glyph disc + ring in the 2D wheel.

## Known limitations

- The bundled ephemeris is a demonstration calculator (astronomy-engine), not a certified production ephemeris; positions are labelled as such in-app.
- Placidus cusps use the iterative semi-arc scheme with equal-house fallback past ±66.5° latitude.
- Unknown birth time → noon assumption; houses flagged approximate.
- No Chiron/Lilith/nodes, no minor aspects beyond quincunx, no transits — out of scope for this phase.
- Birth data is never persisted; only UI prefs + tour completion touch localStorage.
