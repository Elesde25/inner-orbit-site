# Test report — integration stabilization

## Performed
- `npx tsc --noEmit` and `npm run build`: passed. Compiled `dist/index.html` and assets served with Python's HTTP server at the origin root; Chromium loaded atrium, artwork and the WebGL detail book without observed 4xx responses or uncaught page errors.
- Chromium desktop, software WebGL: opened and rotated inspectable book, opened reader, performed mouse drag page turns; verified two distinct leaves and keyboard/page controls in prior visual pass. Enabled Select text mode, selected a passage by mouse, and applied a color.
- Seeded the three legacy localStorage keys: prior highlight resolved from `v0:l0` to the new passage ID and rendered, legacy ledger note and chapter reflection remained in v2, and legacy keys remained present. Created a ledger note and verified it after reload.
- Saved reading anchor persisted through a desktop-to-tablet viewport resize and text-size increases; anchored passage remained visible. Separately verified Continue restores the anchor after reload. All 14 book IDs, 44 book-scoped chapter IDs and 200 passage IDs in the active catalog were unique in the shipped data.
- Added a highlight over an entire long passage and reflowed to a small phone viewport: both fragments were highlighted and their concatenated text matched the original quote.
- Chromium touch emulation: tablet-size swipe advanced the spread; phone-size swipe used the CSS leaf fallback when WebGL creation was forced to fail. The same forced failure displayed the CSS book fallback. Reduced-motion emulation skipped opening and animated page curl. Large-text checks across 390, 768 and 1440 pixel viewports found no tested page overflow.
- Tested after the final changes using isolated browser contexts. Reproducible scripts and prerequisites are in `tests/README.md` in the source ZIP.

## Not performed / limitations
- No physical iPad, iPhone or Android device, Safari/WebKit native long-press selection, Apple Pencil, VoiceOver, TalkBack, keyboard-only full accessibility audit, or cross-browser compatibility test. Emulated touch does not validate native text selection handles or platform scrolling behavior.
- No WebGL GPU memory profiling or stress test across real devices; disposal and context-loss code was reviewed, and renderer-creation failure was simulated. Actual driver-triggered context loss/restoration was not exercised.
- No live Inner Orbit authentication, account-backed adapter, offline synchronization, multi-device merge, API contract, security/privacy or production deployment test; none is implemented.
- Only selected content paths, layouts and highlight scenarios were tested, not every book, content revision, overlap, device dimension or font. Legacy progress/bookmarks containing only page numbers are approximate after reflow. Highlights whose source text is edited may need explicit quote/offset migration.
- Historical transcription, attribution, editorial factual review, visual-asset permissions and jurisdiction-specific rights remain outstanding; see CONTENT-RIGHTS.md.

## Subsequent cover and edition update
- Production build and TypeScript passed again. Static origin-root build loaded in Chromium; tested existing progress migration, highlight rendering/reflow, desktop selection, tablet touch swipe, phone CSS fallback and reduced-motion checks again.
- Parsed counts confirm 81 canonical Tao chapters and 26 canonical Dhammapada chapters covering all verse numbers 1–423, including the 127/128 correction; chapter 81 opened in the reader. The active catalog now has 14 unique book IDs, 151 book-scoped chapter IDs and 1,020 unique passage IDs. The 44/200 counts above describe the previous milestone.
- Visually inspected the Tao and Dhammapada inspectable models after front-art cropping; the Tao medallion no longer has the mismatched opaque ornament. Drag direction was reversed in the pointer handler. Letter engraving is a bump/shading effect, and artwork-derived surface displacement is approximate.
- Counts and spot checks do not replace a full editorial collation of either translation. Other works remain incomplete; see CONTENT-RIGHTS.md. Real-device tests and GPU profiling remain outstanding.

## Latest restoration smoke checks
TypeScript and production build passed. Chromium screenshot of Tao detail showed restored raised framing and central green jewel without the prior speckled displacement; previews were rendered from the same Three.js models. Full Tao/Dhammapada counts and chapter-81 reader smoke passed; reading progress reload passed. Import script asserts 18 Gita chapters, 12 Meditations books, 53 Enchiridion sections, 12 Ecclesiastes chapters/222 verses, and 14 Varieties lecture groups plus preface and postscript. These checks do not prove textual fidelity; the Gita transcription and edition rights require further review. Physical iPad Safari, each cover at all angles, and all newly imported final chapters have not been manually tested.
