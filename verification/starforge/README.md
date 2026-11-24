# Starforge refinement — 14 November 2026

Two connected studios now share composited avatar/environment renderers with the Soul Hub. Existing cosmetic data migrates without resetting growth or chart state. Tier comparison retains the underlying draft. Soulseed is fixed; Bloom uses floral framing and curated colors; Pro adds body-pattern choices, a golden astrolabe, luminous orbital layers and expanded environment controls.

## Verified in the rendered browser
- Avatar colors, aura minimum/maximum, all three body patterns and motion choices update their corresponding rendered layers.
- Galaxy palettes, clear/mist/radiant atmosphere, lighting, three star colors/types, density (16–100 rendered stars), geometry and none/moon/ringed-world companions update the preview.
- Three tiers were compared at standard settings; full heads and feet remain framed.
- Apply updates the actual Soul Hub. Refresh preserves the applied tier, color, palette and star density in this browser.
- Reset restores the draft defaults without changing the applied Hub configuration.
- Hub destination selection → Starforge entry and Starforge → Hub navigation work.
- 390px, 768px and 1440px CSS viewport compositions inspected using the development-only responsive iframe harness; no horizontal overflow observed. Native desktop screenshots also captured. Mobile color selection, Apply and Hub navigation tested.
- Native range keyboard Home/End interactions work. The global pause-motion control suppresses cosmetic motion. The reduced-motion CSS override and renderer motion override were checked in configuration tests; an OS-level reduced-motion emulation was not performed.

## Automated checks
`node verification/starforge/config.test.cjs` passes legacy migration, tier constraints, preserved draft, density, body patterns, motion override and cosmetic-only ownership-boundary checks. Both changed JavaScript files pass Node syntax checks.

## Limits
This is layered 2D artwork, not a 3D pose editor. One approved full-body silhouette is available. Frames are tier-specific. Persistence is browser-local; cloud sync, purchases and real entitlement verification are not implemented. Applying a paid-tier preview sets no payment or functional entitlement. Dynamic effects use a bounded SVG starfield and CSS transforms rather than a particle engine. No real-device touch, GPU performance benchmark or full screen-reader audit was performed.

Screenshots are actual rendered captures; the tier comparison is a crop montage of those captures. The responsive harness is not shipped in the public application.
