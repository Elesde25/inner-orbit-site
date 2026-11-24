# Phase 3.3 bounded verification

- Existing saved demonstration chart reopened: 1997-08-14, 06:24 Denver; no original input migration or progress reset.
- Rendered at 390 × 844, 768 × 1000, 1440 × 1000 and 2560 × 1000 CSS pixels in the responsive iframe harness. No horizontal document overflow in inspected layouts. Tablet changed to one-column after visual inspection showed an undersized wheel.
- Desktop: Sun, Moon, Mercury and Mars selected directly on the SVG; House 3 selected with Enter. Reading and selected data updated. Wheel stayed at 22px top while scrolling lower in its parent reading section; stickiness is constrained by that parent section.
- Six reading chapters opened. House ruler, planet, aspect and Show Me Why/How content reviewed.
- Mobile: compact access appeared after wheel scrolled away; native modal opened; planets, house 7 and an aspect selected; corresponding reading appeared after Read this interpretation. Close and Escape tested. After correcting a close-state/focus timing defect, Escape restored focus to View Chart.
- Detailed viewer: zoom 100→150%, keyboard horizontal pan (40px) and pointer drag pan (165px) observed; Fit restored view. This is browser-based pointer/keyboard testing, not physical-device multi-touch testing.
- Expert: Pluto visibility changed wheel/table/matrix from 10 to 9 entries; degrees toggle removed degree labels; Square filter showed 3 lines; line visibility removed them; 0° orb showed none. Whole Sign→Equal changed house cusps while Sun stayed 141.74790°. Original Whole Sign and 6° settings restored.
- JSON file actually downloaded from top-level Observatory, parsed and checked: schema v1, 10 points, 12 cusps, 10 aspects. Iframe download-event capture timed out, so the successful top-level test was used.
- Calculation suites passed: independent Swiss Ephemeris/Moshier fixture, DST/unknown-time/polar cases, transit invariance and date/orb boundaries, versioned-model round trip, original numerology/aspect/house assertions.
- Reduced-motion rules reviewed; new workspace adds no continuous animation. OS-level reduced-motion emulation and physical device QA were not performed.
- Existing print/PDF action remains; print pagination is not certified. No cloud saving, chart collection, new ephemeris or unsupported calculation was added.
