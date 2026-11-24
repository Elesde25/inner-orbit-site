"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import StageScene from "./StageScene";
import { BASE_METALS, CATALYSTS, METALS, STAGES } from "./data";
import { Arrow, FireGlyph, MetalGlyph } from "./glyphs";

/* ------------------------------------------------------------------ */
/*  The Core Ingredients                                               */
/* ------------------------------------------------------------------ */

export function Ingredients() {
  const [base, setBase] = useState(1);
  const [cat, setCat] = useState(0);
  const b = BASE_METALS[base];
  const c = CATALYSTS[cat];

  return (
    <section id="art" className="al-section">
      <div className="al-wrap">
        <header className="al-heading">
          <span className="al-eyebrow">The art · what you work with</span>
          <h2>
            Three ingredients. <em>All of them yours.</em>
          </h2>
          <p>
            Instead of physical chemicals, personal alchemy works with what is already inside you. Nothing is thrown
            away — the heaviest material is exactly what the gold is made from.
          </p>
        </header>

        <div className="al-ingredients">
          <article className="al-glass al-ingredient" data-kind="lead">
            <div className="al-ingredient-glyph">
              <MetalGlyph metal="lead" />
            </div>
            <span className="al-kicker">Base metals</span>
            <h3>What is heavy</h3>
            <p>Raw, dense and unrefined — the parts of you that have not yet been worked.</p>
            <ul>
              <li>Unprocessed emotions</li>
              <li>Fears</li>
              <li>Ego</li>
              <li>Trauma</li>
              <li>Limiting beliefs</li>
            </ul>
          </article>

          <span className="al-operator" aria-hidden="true">
            +
          </span>

          <article className="al-glass al-ingredient" data-kind="catalyst">
            <div className="al-ingredient-glyph">
              <FireGlyph />
            </div>
            <span className="al-kicker">Catalysts</span>
            <h3>What applies the heat</h3>
            <p>The forces that make change possible. Without them, lead simply stays lead.</p>
            <ul>
              <li>Active awareness</li>
              <li>Life challenges</li>
              <li>Discipline</li>
              <li>Creative energy</li>
            </ul>
          </article>

          <span className="al-operator" aria-hidden="true">
            <Arrow />
          </span>

          <article className="al-glass al-ingredient" data-kind="gold">
            <div className="al-ingredient-glyph">
              <MetalGlyph metal="gold" />
            </div>
            <span className="al-kicker">The Gold</span>
            <h3>What you become</h3>
            <p>Not a perfect self — a whole one. Refined, integrated and unmistakably your own.</p>
            <ul>
              <li>Inner strength</li>
              <li>Wisdom</li>
              <li>Integration</li>
              <li>An authentic sense of self</li>
            </ul>
          </article>
        </div>

        <div className="al-glass al-table">
          <div className="al-table-pick">
            <span className="al-kicker">Try a transmutation · choose a base metal</span>
            <div className="al-chips" role="group" aria-label="Base metal">
              {BASE_METALS.map((m, i) => (
                <button key={m.id} type="button" className="al-chip" aria-pressed={i === base} onClick={() => setBase(i)}>
                  {m.name}
                </button>
              ))}
            </div>
            <span className="al-kicker al-kicker-gap">Add a catalyst</span>
            <div className="al-chips" role="group" aria-label="Catalyst">
              {CATALYSTS.map((m, i) => (
                <button key={m.id} type="button" className="al-chip" aria-pressed={i === cat} onClick={() => setCat(i)}>
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          <div className="al-table-result" aria-live="polite">
            <span className="al-kicker">Becomes</span>
            <p className="al-table-gold" key={`${base}-${cat}`}>
              {b.gold}
            </p>
            <p key={`s-${base}-${cat}`} className="al-table-line">
              {b.how} — {c.flavour}.
            </p>
            <p className="al-table-formula">
              {b.name} <span>+</span> {c.name} <span>→</span> <em>{b.gold}</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  The Seven Stages — pinned, scroll-driven                           */
/* ------------------------------------------------------------------ */

export function StagesExplorer() {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      setIdx(Math.min(6, Math.floor(p * 7)));
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / 7) * span, behavior: "smooth" });
  };

  const s = STAGES[idx];
  const metal = METALS[s.metal];

  return (
    <section id="stages" className="al-stages-section">
      <div className="al-wrap">
        <header className="al-heading">
          <span className="al-eyebrow">The seven stages of transformation</span>
          <h2>
            One slow turning <em>of lead to gold.</em>
          </h2>
          <p>
            Psychological and alchemical traditions map the inner journey through seven operations. Scroll to move the
            matter through each one — and watch what it becomes.
          </p>
        </header>
      </div>

      <div className="al-stages-track" ref={trackRef}>
        <div className="al-stages-sticky" style={{ "--stage": s.color } as CSSProperties}>
          <StageScene stage={idx} className="al-stages-scene" />

          <div className="al-stage-copy" key={s.id}>
            <span className="al-stage-num" aria-hidden="true">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <p className="al-stage-meta">
              <MetalGlyph metal={s.metal} />
              <span>
                Stage {idx + 1} of 7 · {s.phase}, {s.phaseNote}
              </span>
            </p>
            <h3>{s.name}</h3>
            <p className="al-stage-summary">{s.summary}</p>
            <p className="al-stage-body">{s.body}</p>
            <dl className="al-stage-facts">
              <div>
                <dt>{s.principleKind}</dt>
                <dd>{s.principle}</dd>
              </div>
              <div>
                <dt>Metal</dt>
                <dd>
                  {metal.name === "False Gold" ? "Gold" : metal.name} · {metal.planet}
                </dd>
              </div>
              <div>
                <dt>In life</dt>
                <dd>{s.feels[0]}</dd>
              </div>
            </dl>
            <p className="al-stage-question">“{s.question}”</p>
          </div>

          <nav className="al-stage-rail" aria-label="Stages">
            <span className="al-stage-rail-line" aria-hidden="true">
              <span ref={barRef} />
            </span>
            {STAGES.map((st, i) => (
              <button
                key={st.id}
                type="button"
                className="al-stage-dot"
                aria-current={i === idx ? "step" : undefined}
                data-done={i < idx}
                onClick={() => goTo(i)}
                style={{ "--c": st.color } as CSSProperties}
              >
                <MetalGlyph metal={st.metal} />
                <span>{st.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
