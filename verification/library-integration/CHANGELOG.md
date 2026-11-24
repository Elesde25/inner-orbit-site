# Celestial Library — update, 2026-11-17

- Preserved the React/Vite architecture, four room artworks, entrance, Living Tome and its interpretation/interactive layers.
- Hid empty catalog entries. Added an original ten-work historical overview of Gnostic and early mystical literature, plus a six-chapter geometry companion. The new texts are commentary, not ancient translations.
- Enhanced data-driven covers with motif-specific engravings, corner jewels and raised spine bands; the tome frame takes the current cover colors.
- Added a device-local Inner Ledger, Markdown export and six-color passage highlighting. Highlight selections are limited to a single paragraph. Tap a saved highlight to edit its color, note or remove it. Notes and highlights are not synced.
- Improved reader overflow and disabled swipe navigation starting on text to protect touch selection. Existing font, spacing, theme, motion, bookmarks and progress controls remain.
- Replaced questionable Gita quotations in the inherited prototype with explicitly labeled original summaries.

## Important release limitations
This is a prototype build, not a fully verified production release. Existing historical passages were not comprehensively checked line-by-line against their stated editions. The inherited translations, attributions, images, and original-content ownership need editorial and legal review before publication. No claim of worldwide public-domain status is made here. The cover art has been enhanced, but not every title has a bespoke design. The Gnostic collection contains educational overviews, not the complete ancient texts. New geometry topics are grouped in a companion rather than separate full volumes. The integration adapter is not yet shared by the inherited bookmarks/progress/reflections; those remain in the pre-existing localStorage store. Highlights are anchored to verse/line indices and text offsets: content edits that reorder lines can orphan them; they are not robust immutable editorial identifiers. iPad Safari and accessibility/zoom need real-device testing. No account sync or authentication is included.

## Book and page presentation update
- Replaced flat cover graphics and the bright diamond decorations with illustrated sculptural bindings, CSS-3D spines, page blocks and metal title plaques. Ten cover illustrations were generated for specific titles; four additional titles have custom drawn overlays but share underlying illustrations with other books. These four still need their own bespoke illustrations to satisfy the individual-art direction fully.
- The reader uses the selected cover art on its binding, clean parchment pages, layered cover and page edges. Page and chapter navigation now animates a turning 3D CSS leaf, with a reduced-motion alternative.
- The cover relief is illustrated imagery combined with CSS depth, not individually modeled 3D geometry. Real-device Safari testing and accessibility review are still required.

## Shelf and panel refinement
- Replaced the featured carousel with a balanced responsive grid and reserved space for hover motion. Upright covers no longer use a tilted rest state; cover art preserves its native aspect ratio.
- Added a subdued original purple nebula panel background with blue and green currents, while retaining the room imagery and reading surfaces.
- Reworked cover title plaques as more legible, raised engraved metal with rivets and material-sensitive treatments.
- Corrected the Gita catalog description to match the original commentary currently in the reader.

## Interactive tome and galaxy update
- Replaced panel artwork with a locally copied, close-cropped galaxy image from the linked Inner Orbit site, with subdued blue/green atmospheric layers. Room environment artwork remains unchanged.
- Removed the duplicate dimmed-cover background and stopped stretching the cover images; cover artwork is center-cropped to the consistent book shape instead. This can trim the outer edges of wider illustrations.
- Removed the line-spacing control while retaining the reader's stored spacing preference and text-size controls.
- Book details and the reader's initial book stage now offer a CSS-3D book with draggable rotation and keyboard-accessible rotation controls. Opening animates the front board before the reading spread appears. Drag the right or left page edge to turn; page buttons and reduced-motion behavior remain available. Text in the main page area remains selectable for highlighting.
- Verified a desktop Chromium rotation/open/page-drag flow and a Chromium-emulated touch page drag. Actual iPad Safari still requires device testing. The book uses CSS 3D planes and illustrated covers, not a fully sculpted 3D model; the open spread is a separate reader layout after the opening transition.

## Three.js book and page update
- Replaced the inspection model with a larger Three.js book, including textured front and back boards, a binding, page block, lighting, cover bump detail, mouse/touch rotation, accessible rotation buttons, and a slower hinged opening. The illustrated cover provides relief texture; it is not a fully sculpted model of every ornament.
- Added a Three.js segmented page mesh that bends while the page edge is dragged, then settles with spring-damped movement. Button-triggered turns now take about 1.9 seconds. This is an approximate spring-driven visual model, not a full cloth/rigid-body physics simulation. Reading and highlighting remain HTML; the turning sheet temporarily uses a rendered approximation of the outgoing page text.
- Created eight centered, rotated variants of the linked Inner Orbit galaxy for neighboring nebula panels, with the existing blue/green accents.
- Retained a CSS fallback when WebGL cannot initialize and reduced-motion behavior. Tested rotation, opening and dragging in desktop Chromium, plus emulated touch; real iPad Safari still requires testing.

## Sculpted artifact refinement
- Rebuilt the inspectable Three.js tomes with beveled boards, rounded leather-grain bindings, real raised metal frames, corner guards, clasp details, ornament curves, jewel settings, polished cabochons and dimensional title plates.
- Added title-specific relief palettes and styles, sculpted spine filigree and bands, and restrained gem light, halo and slow stardust. Ambient effects respect the library's minimal/subtle and motion-safe preferences.
- Existing cover illustrations remain as the underlying surface: fine detail in those images is still a texture rather than individually sculpted mesh. Catalog thumbnails are illustrated representations, while the detail and opening stages use the redesigned 3D models.
- Desktop Chromium rotation/open/turn and Chromium-emulated touch page turning were checked; actual iPad Safari and GPU performance remain to be verified.

## Bound-page gestures and layout
- Reversed both axes of cover drag rotation to follow the requested direction. Accessible rotation buttons remain available.
- The reading surface now accepts a directional drag starting anywhere on a leaf, not just its edge; navigation buttons and keyboard arrows remain available. To avoid confusing selection with turning, select text on desktop using Alt-drag; on touch devices touch and hold to select, or swipe promptly to turn. Actual iPad Safari selection still needs hands-on verification.
- Two distinct leaves and a central gutter are shown on screens at least 700 pixels wide, with a single leaf on smaller phones. An empty facing page remains when there is an odd number of pages. Removed scrollbars and the in-page Living Page control (the Living Page remains available from the reader bar).
- Text is re-paginated to fit leaf dimensions and font settings; long paragraphs may be split between leaves. Pagination changes with viewport or text size, so older saved page numbers may land at a different place after resizing. Text highlight offsets are retained for split paragraphs; highlights spanning a new page boundary may not appear until the layout changes again.
- Tested desktop mouse turns and Alt-selection, touchscreen emulation at tablet and phone sizes, and large-text clipping checks. Real iPad Safari and assistive-technology testing remain outstanding.

## Integration stabilization
- Assigned durable explicit UUID passage IDs in source data; existing book/chapter IDs are retained. New progress and bookmarks use passage anchors and UTF-16 offsets; resizing and font changes re-resolve anchors rather than treating page numbers as identity.
- Highlights render intersecting portions of an original passage on every reflowed page. Added a visible Select text mode that yields to native selection, with page controls still available.
- Consolidated progress, bookmarks, chapter reflections, highlights, ledger and preferences behind a versioned persistence adapter. The default v2 snapshot migrates legacy data without deleting legacy keys. Page-only legacy positions can only be approximated on the new layout.
- Three.js renderer cleanup now also handles WebGL context loss, late texture loading and explicit context release; CSS fallback remains available. Reader starfield honors motion-safe settings.
- Added INTEGRATION.md and TEST-REPORT.md; editorial and rights verification remains outstanding, and no main platform site was changed or deployed.

## Cover alignment and first full editions
- Corrected mouse/finger drag direction on the inspectable 3D book. Cropped photographic spines and fore-edges out of the inspectable front textures; the physical Three.js spine and paper block are now the sole binding/edges. Matched wrap material colors more closely to the cover, removed misaligned generic ornaments, placed a shallow transparent dome over selected matching medallions, and used texture-driven surface displacement plus bump shading. This is not a fully hand-sculpted mesh for each illustrated motif.
- Changed title plates to use dark letter recess shading and a bump map to resemble engraved metal. The lettering is a visual/normal approximation, not cut-out geometry.
- Added all 81 chapters of James Legge's Tao Te Ching and all 26 chapters covering 423 numbered verses of F. Max Müller's Dhammapada, using the sources and qualifications in CONTENT-RIGHTS.md. The original curated readings are retained as separately labeled entries so existing passage IDs, highlights and notes remain reachable. Existing commentary has not been automatically attributed to the full editions.
- Corrected an omission in the Gutenberg Dhammapada source: its verse 127 is missing and verse 128 mislabeled as 127; compared/restored against Wikisource. Combined verses are preserved as combined passages. Automatic chapter/verse-number counts passed; full editorial transcription review is outstanding.
- Other historical works and unfinished original writing are not yet complete. Their existing selection/unfinished labels remain; no claims of overall catalog completeness are made.

## Latest cover and edition restoration
- Removed texture displacement; restored actual raised ornament geometry. Shelf artwork now uses transparent captures of the same 3D models shown in the book view, avoiding many simultaneous WebGL contexts.
- Added historical reading texts for all 18 chapters of the Telang Gita, 12 books of Long's Meditations, 53 Long Enchiridion sections, 12 KJV Ecclesiastes chapters, and James's preface, 20 lectures and postscript. Earlier curated chapters and their IDs remain accessible. See content rights for omissions and editorial caveats. Gita remains conservatively labeled selection pending collation.
