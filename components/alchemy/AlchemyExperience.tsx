"use client";

import { useEffect, useState } from "react";
import GreatWork from "./GreatWork";
import HeroVessel from "./HeroVessel";
import { Ingredients, StagesExplorer } from "./Learn";
import { Arrow } from "./glyphs";

const NAV = [
  { id: "art", label: "The Art" },
  { id: "stages", label: "Seven Stages" },
  { id: "great-work", label: "Your Great Work" },
];

export default function AlchemyExperience() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
      const mid = window.innerHeight * 0.4;
      let current = "";
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= mid) current = n.id;
      }
      setActive(current);
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

  return (
    <>
      <a className="al-skip" href="#main">
        Skip to the experience
      </a>

      <header className="al-header" data-scrolled={scrolled}>
        <nav className="al-nav" aria-label="Inner Alchemy">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? "page" : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="al-header-actions">
          <a href="/#home" target="_top" className="al-realm">
            <i aria-hidden="true" /> SOUL HUB
          </a>
          <a className="al-btn al-btn-primary al-btn-sm" href="#great-work">
            Begin <Arrow />
          </a>
        </div>
      </header>

      <main id="main">
        <section id="top" className="al-hero">
          <div className="al-wrap al-hero-inner">
            <div className="al-hero-copy">
              <span className="al-eyebrow">Inner Alchemy · the Great Work</span>
              <h1>
                Turn your lead <em>into gold.</em>
              </h1>
              <p className="al-lede">
                Personal alchemy is the psychological and spiritual art of turning raw, heavy or stagnant experience
                into inner strength, wisdom and self-actualization — the way the old alchemists sought to transmute
                base metal into gold.
              </p>
              <div className="al-hero-cta">
                <a className="al-btn al-btn-primary" href="#great-work">
                  Begin your Great Work <Arrow />
                </a>
                <a className="al-btn al-btn-secondary" href="#art">
                  Learn the process
                </a>
              </div>
              <dl className="al-hero-facts">
                <div>
                  <dt>3</dt>
                  <dd>ingredients</dd>
                </div>
                <div>
                  <dt>7</dt>
                  <dd>stages of transformation</dd>
                </div>
                <div>
                  <dt>1</dt>
                  <dd>Stone, uniquely yours</dd>
                </div>
              </dl>
            </div>

            <div className="al-vessel">
              <HeroVessel />
              <p className="al-vessel-hint">
                <i aria-hidden="true" /> Touch the vessel to stir it
              </p>
            </div>
          </div>

          <a className="al-scroll-cue" href="#art" aria-label="Continue to the art of alchemy">
            <span />
          </a>
        </section>

        <Ingredients />
        <StagesExplorer />
        <GreatWork />
      </main>

      <footer className="al-footer">
        <a href="#top" className="al-footer-brand">
          INNER ORBIT <span>✧</span>
        </a>
        <p>Written in the stars. Lived by you.</p>
        <nav aria-label="Inner Alchemy sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`}>
              {n.label}
            </a>
          ))}
        </nav>
        <small>
          Alchemy is a symbolic tool for reflection — not a scientific assessment, a prediction, or a substitute for
          professional care.
        </small>
      </footer>
    </>
  );
}
