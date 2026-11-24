import type { MetalId } from "./data";

/** Inner Orbit brand mark — identical geometry to the site header. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r="19" />
      <ellipse cx="30" cy="30" rx="28" ry="9" transform="rotate(-27 30 30)" />
      <path d="M30 19v22M19 30h22" />
      <circle cx="30" cy="30" r="3" />
    </svg>
  );
}

export function Brand({ href = "#top", target }: { href?: string; target?: string }) {
  return (
    <a className="al-brand" href={href} target={target} aria-label="Inner Orbit home">
      <BrandMark />
      <span>
        INNER ORBIT
        <small>A UNIVERSE WITHIN</small>
      </span>
    </a>
  );
}

/** The seven planetary metals, drawn as line glyphs so they render identically everywhere. */
export function MetalGlyph({ metal, className, title }: { metal: MetalId; className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {metal === "lead" && (
        <path d="M8.5 3.5v11M5.5 6.5h6M8.5 11.5c1.6-2.6 6.5-2.6 6.5 1.2 0 2.6-2.6 3.6-2.6 5.6 0 1.4 1.2 2.2 2.8 1.6" />
      )}
      {metal === "tin" && <path d="M5.5 7.2c1.4-2.6 6-2.7 6 .9 0 3.2-3.2 5.6-6 6.9H18M15 5v15" />}
      {metal === "iron" && (
        <>
          <circle cx="10" cy="14" r="5" />
          <path d="M13.6 10.4 19 5M14.8 5H19v4.2" />
        </>
      )}
      {metal === "copper" && (
        <>
          <circle cx="12" cy="9" r="5" />
          <path d="M12 14v7M8.5 17.8h7" />
        </>
      )}
      {metal === "quicksilver" && (
        <>
          <circle cx="12" cy="11.2" r="4.2" />
          <path d="M7.8 3.4a4.2 4.2 0 0 0 8.4 0M12 15.4V21M9 18.4h6" />
        </>
      )}
      {metal === "silver" && <path d="M15.5 4.3A8 8 0 1 0 15.5 19.7 9.5 9.5 0 0 1 15.5 4.3Z" />}
      {metal === "gold" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

export function FireGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4 20.5 19.5h-17z" />
    </svg>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 10h13M11.5 5l5 5-5 5" />
    </svg>
  );
}
