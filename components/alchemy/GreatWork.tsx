"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import StageScene, { type StageSceneHandle } from "./StageScene";
import { PRIMA } from "./three/formations";
import {
  BURDENS,
  CATALYSTS,
  GOLDS,
  STAGES,
  cap,
  guidance,
  opusText,
  profileOf,
  streak,
  todayKey,
  type CatalystId,
  type Journey,
  type Profile,
} from "./data";
import { Arrow, MetalGlyph } from "./glyphs";
import {
  Calcination,
  Chip,
  Coagulation,
  Conjunction,
  Dissolution,
  Distillation,
  Fermentation,
  Field,
  Separation,
  riteDone,
} from "./Rites";
import { useJourney, type SaveState } from "./useJourney";

const RITES = [Calcination, Dissolution, Separation, Conjunction, Fermentation, Distillation, Coagulation];

type Update = (fn: (j: Journey) => Journey) => void;

export default function GreatWork() {
  const { journey, ready, save, update, erase } = useJourney();
  const scene = useRef<StageSceneHandle>(null);
  const lab = useRef<HTMLDivElement>(null);
  const profile = useMemo(() => profileOf(journey), [journey]);
  const step = ready ? journey.step : 0;

  const sceneStage = step === 0 ? PRIMA : step >= 8 ? 6 : step - 1;
  const tint =
    step === 0 ? (journey.intake.burdens.length ? profile.metal.color : undefined) : step >= 8 ? profile.gold?.color : undefined;

  const go = useCallback(
    (n: number) => {
      update((j) => ({
        ...j,
        step: n,
        maxStep: Math.max(j.maxStep, n),
        startedAt: j.startedAt ?? new Date().toISOString(),
        completedAt: n === 8 ? (j.completedAt ?? new Date().toISOString()) : j.completedAt,
      }));
      requestAnimationFrame(() => {
        const el = lab.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top < 60 || r.top > window.innerHeight * 0.45) {
          window.scrollTo({ top: r.top + window.scrollY - 92, behavior: "smooth" });
        }
      });
    },
    [update],
  );

  const setRite = useCallback(
    (patch: Partial<Journey["rites"]>) => update((j) => ({ ...j, rites: { ...j.rites, ...patch } })),
    [update],
  );

  const caption =
    step === 0
      ? { k: "Prima materia", t: "The unformed beginning" }
      : step >= 8
        ? { k: "The Philosopher’s Stone", t: `Tempered toward ${profile.goldWord}` }
        : { k: `Stage ${step} · ${STAGES[step - 1].principle}`, t: STAGES[step - 1].name };

  const stageColor = step >= 1 && step <= 7 ? STAGES[step - 1].color : "#ecc78d";

  return (
    <section id="great-work" className="al-section al-work">
      <div className="al-wrap">
        <header className="al-heading">
          <span className="al-eyebrow">The Great Work · your personal opus</span>
          <h2>
            Now make it <em>yours.</em>
          </h2>
          <p>
            Seven short rites, shaped by what you bring to them. Name your lead, choose your catalyst, and move your
            own material through the fire — until something solid and golden is left in your hands.
          </p>
        </header>

        <div className="al-lab" ref={lab} style={{ "--stage": stageColor } as CSSProperties}>
          <div className="al-lab-scene">
            <StageScene ref={scene} stage={sceneStage} tint={tint} />
            <div className="al-lab-caption" key={caption.t}>
              <span className="al-kicker">{caption.k}</span>
              <strong>{caption.t}</strong>
            </div>
          </div>

          <div className="al-lab-panel">
            <Rail journey={journey} step={step} go={go} />

            {!ready ? (
              <p className="al-loading">Preparing the laboratory…</p>
            ) : step === 0 ? (
              <Intake key={journey.id} journey={journey} profile={profile} update={update} onBegin={() => go(1)} />
            ) : step <= 7 ? (
              <RitePanel stage={step - 1} journey={journey} profile={profile} setRite={setRite} scene={scene} go={go} />
            ) : (
              <Stone journey={journey} profile={profile} update={update} go={go} erase={erase} />
            )}

            <LabFoot save={save} started={journey.maxStep > 0 || journey.intake.burdens.length > 0} erase={erase} />
          </div>
        </div>

        <p className="al-disclaimer">
          Alchemy is offered here as a symbolic language for reflection and self-knowledge. It is not medical or
          psychological treatment — if what surfaces feels too heavy to hold alone, please reach out to someone
          qualified to hold it with you.
        </p>
      </div>
    </section>
  );
}

/* ---------- progress rail ---------- */

function Rail({ journey, step, go }: { journey: Journey; step: number; go: (n: number) => void }) {
  return (
    <ol className="al-rail" aria-label="Your progress through the Great Work">
      <li>
        <button
          type="button"
          className="al-rail-dot"
          aria-current={step === 0 ? "step" : undefined}
          data-done={journey.maxStep > 0}
          aria-label="Prima materia — your starting material"
          onClick={() => go(0)}
        >
          <span aria-hidden="true">✧</span>
        </button>
      </li>
      {STAGES.map((s, i) => {
        const n = i + 1;
        return (
          <li key={s.id}>
            <button
              type="button"
              className="al-rail-dot"
              disabled={n > journey.maxStep}
              aria-current={step === n ? "step" : undefined}
              data-done={journey.maxStep > n}
              aria-label={`Stage ${n}: ${s.name}`}
              style={{ "--c": s.color } as CSSProperties}
              onClick={() => go(n)}
            >
              <MetalGlyph metal={s.metal} />
            </button>
          </li>
        );
      })}
      <li>
        <button
          type="button"
          className="al-rail-dot al-rail-stone"
          disabled={journey.maxStep < 8}
          aria-current={step === 8 ? "step" : undefined}
          aria-label="Your Philosopher’s Stone"
          onClick={() => go(8)}
        >
          <span aria-hidden="true">◆</span>
        </button>
      </li>
    </ol>
  );
}

/* ---------- intake: prima materia ---------- */

function Intake({
  journey,
  profile,
  update,
  onBegin,
}: {
  journey: Journey;
  profile: Profile;
  update: Update;
  onBegin: () => void;
}) {
  const [sub, setSub] = useState(journey.maxStep > 0 ? 3 : 0);
  const it = journey.intake;
  const setIntake = (patch: Partial<Journey["intake"]>) => update((j) => ({ ...j, intake: { ...j.intake, ...patch } }));
  const toggleBurden = (id: string) => {
    if (it.burdens.includes(id)) setIntake({ burdens: it.burdens.filter((b) => b !== id) });
    else if (it.burdens.length < 3) setIntake({ burdens: [...it.burdens, id] });
  };
  const name = it.name.trim();

  if (sub === 0) {
    const ok = it.burdens.length > 0 || it.leadWords.trim().length > 0;
    return (
      <div className="al-step" key="s0">
        <span className="al-kicker">Before the fire · 1 of 3</span>
        <h3>
          What are you <em>working with?</em>
        </h3>
        <p className="al-step-lede">
          Every Great Work begins with prima materia — the raw, heavy material of a real life. Choose up to three that
          are true for you right now.
        </p>
        <div className="al-chips">
          {BURDENS.map((b) => (
            <Chip key={b.id} on={it.burdens.includes(b.id)} disabled={!it.burdens.includes(b.id) && it.burdens.length >= 3} onClick={() => toggleBurden(b.id)}>
              {b.label}
            </Chip>
          ))}
        </div>
        <Field label="Or name your lead in your own words" hint="Optional. If you write something, the rites will speak to it directly.">
          <input
            className="al-input"
            value={it.leadWords}
            maxLength={80}
            aria-label="Your lead, in your own words"
            placeholder="e.g. the fear of starting over"
            onChange={(e) => setIntake({ leadWords: e.target.value })}
          />
        </Field>
        <div className="al-step-nav">
          <span className="al-note">{it.burdens.length}/3 chosen</span>
          <button type="button" className="al-btn al-btn-primary" disabled={!ok} onClick={() => setSub(1)}>
            Continue <Arrow />
          </button>
        </div>
      </div>
    );
  }

  if (sub === 1) {
    return (
      <div className="al-step" key="s1">
        <span className="al-kicker">Before the fire · 2 of 3</span>
        <h3>
          What moves you <em>to change?</em>
        </h3>
        <p className="al-step-lede">
          A catalyst is whatever applies the heat. Choose the one that has actually worked on you before — not the one
          you think should.
        </p>
        <div className="al-options">
          {CATALYSTS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="al-option al-option-rich"
              aria-pressed={it.catalyst === c.id}
              onClick={() => setIntake({ catalyst: c.id as CatalystId })}
            >
              <i aria-hidden="true" />
              <span>
                <strong>{c.name}</strong>
                {c.line}
              </span>
            </button>
          ))}
        </div>
        <div className="al-step-nav">
          <button type="button" className="al-btn al-btn-ghost" onClick={() => setSub(0)}>
            ← Back
          </button>
          <button type="button" className="al-btn al-btn-primary" disabled={!it.catalyst} onClick={() => setSub(2)}>
            Continue <Arrow />
          </button>
        </div>
      </div>
    );
  }

  if (sub === 2) {
    const ok = it.gold !== "" || it.goldWords.trim().length > 0;
    return (
      <div className="al-step" key="s2">
        <span className="al-kicker">Before the fire · 3 of 3</span>
        <h3>
          What would <em>gold</em> feel like?
        </h3>
        <p className="al-step-lede">Not what you want to achieve — what you want to be made of when this Work is done.</p>
        <div className="al-chips">
          {GOLDS.map((g) => (
            <Chip key={g.id} on={it.gold === g.id} onClick={() => setIntake({ gold: g.id })}>
              {g.name}
            </Chip>
          ))}
        </div>
        <div className="al-field-pair">
          <Field label="In your own words" hint="Optional.">
            <input
              className="al-input"
              value={it.goldWords}
              maxLength={60}
              aria-label="Your gold, in your own words"
              placeholder="e.g. a quiet mind"
              onChange={(e) => setIntake({ goldWords: e.target.value })}
            />
          </Field>
          <Field label="What shall we call you?" hint="Optional — it is engraved on your Stone.">
            <input
              className="al-input"
              value={it.name}
              maxLength={40}
              autoComplete="given-name"
              aria-label="Your name"
              placeholder="First name"
              onChange={(e) => setIntake({ name: e.target.value })}
            />
          </Field>
        </div>
        <div className="al-step-nav">
          <button type="button" className="al-btn al-btn-ghost" onClick={() => setSub(1)}>
            ← Back
          </button>
          <button type="button" className="al-btn al-btn-primary" disabled={!ok} onClick={() => setSub(3)}>
            Read my prima materia <Arrow />
          </button>
        </div>
      </div>
    );
  }

  const m = profile.metal;
  const crucible = STAGES[profile.crucible];
  return (
    <div className="al-step" key="s3">
      <span className="al-kicker">Your prima materia</span>
      <h3>
        {name ? `${name}, your` : "Your"} Work begins in <em>{m.name === "False Gold" ? "false gold" : m.name.toLowerCase()}.</em>
      </h3>
      <p className="al-step-lede">
        From {profile.lead} toward {profile.goldWord}. This is the material — and the map — for the seven rites ahead.
      </p>
      <dl className="al-reading-grid">
        <div style={{ "--c": m.color } as CSSProperties}>
          <dt>
            <MetalGlyph metal={m.id} /> Base metal
          </dt>
          <dd>
            {m.name} · {cap(m.planet)}
          </dd>
          <p>
            Its shadow: {m.shadow}. Refined, it becomes {m.gift}.
          </p>
        </div>
        <div>
          <dt>Catalyst</dt>
          <dd>{profile.catalyst?.name ?? "Awareness"}</dd>
          <p>{profile.catalyst?.line ?? "You change by seeing clearly."}</p>
        </div>
        <div style={{ "--c": profile.gold?.color ?? "#ecc78d" } as CSSProperties}>
          <dt>The gold you seek</dt>
          <dd>{cap(profile.goldWord)}</dd>
          <p>Your Stone will be tempered in this colour. Every rite bends toward it.</p>
        </div>
        <div style={{ "--c": crucible.color } as CSSProperties}>
          <dt>Your crucible</dt>
          <dd>
            Stage {profile.crucible + 1} · {crucible.name}
          </dd>
          <p>{m.name} is traditionally worked here. Expect this stage to ask the most of you.</p>
        </div>
      </dl>
      <div className="al-step-nav">
        <button type="button" className="al-btn al-btn-ghost" onClick={() => setSub(0)}>
          ← Adjust
        </button>
        <button type="button" className="al-btn al-btn-primary" onClick={onBegin}>
          {journey.maxStep > 0 ? "Return to the furnace" : "Light the furnace"} <Arrow />
        </button>
      </div>
    </div>
  );
}

/* ---------- one rite ---------- */

function RitePanel({
  stage,
  journey,
  profile,
  setRite,
  scene,
  go,
}: {
  stage: number;
  journey: Journey;
  profile: Profile;
  setRite: (patch: Partial<Journey["rites"]>) => void;
  scene: RefObject<StageSceneHandle | null>;
  go: (n: number) => void;
}) {
  const s = STAGES[stage];
  const Rite = RITES[stage];
  const done = riteDone(stage, journey);

  return (
    <div className="al-step al-rite-panel" key={s.id}>
      <header className="al-rite-head">
        <div className="al-rite-glyph">
          <MetalGlyph metal={s.metal} />
        </div>
        <div>
          <span className="al-kicker">
            Stage {stage + 1} of 7 · {s.principle}
          </span>
          <h3>
            {s.name}. <em>{s.rite}</em>
          </h3>
        </div>
      </header>
      <p className="al-guidance">{guidance(stage, profile)}</p>
      {profile.crucible === stage && (
        <p className="al-crucible">
          <i aria-hidden="true" />
          Your crucible. {profile.metal.name} is worked in this stage — give it a little more time than the others.
        </p>
      )}

      <Rite journey={journey} profile={profile} setRite={setRite} scene={scene} onSeal={() => go(8)} />

      <footer className="al-step-nav">
        <button type="button" className="al-btn al-btn-ghost" onClick={() => go(stage)}>
          ← Back
        </button>
        {stage < 6 && (
          <button type="button" className="al-btn al-btn-primary" disabled={!done} onClick={() => go(stage + 2)}>
            {done ? `On to ${STAGES[stage + 1].name}` : "Complete the rite to continue"} <Arrow />
          </button>
        )}
      </footer>
    </div>
  );
}

/* ---------- the Stone ---------- */

function Stone({
  journey,
  profile,
  update,
  go,
  erase,
}: {
  journey: Journey;
  profile: Profile;
  update: Update;
  go: (n: number) => void;
  erase: () => void;
}) {
  const r = journey.rites;
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const name = journey.intake.name.trim();
  const kept = [...r.sorted.filter((s) => s.keep).map((s) => s.text), r.truth.trim()].filter(Boolean);
  const today = todayKey();
  const practiced = journey.practiceLog.includes(today);
  const run = streak(journey.practiceLog);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: todayKey(d), label: d.toLocaleDateString(undefined, { weekday: "narrow" }) };
  });
  const sealed = journey.completedAt
    ? new Date(journey.completedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(opusText(journey));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const rows: [string, string][] = [
    ["I burned", r.burn],
    ["I let myself feel", r.feelings.join(", ")],
    ["I keep", kept.join(" · ")],
    ["I welcome back", [r.shadow.trim(), r.shadowGift.trim()].filter(Boolean).join(" — ")],
    ["I am becoming", r.becoming],
  ];

  return (
    <div className="al-step al-stone" key="stone">
      <span className="al-kicker">The Work is sealed{sealed ? ` · ${sealed}` : ""}</span>
      <h3>
        {name ? `${name}, this` : "This"} is your <em>Philosopher’s Stone.</em>
      </h3>
      <p className="al-step-lede">
        From {profile.lead} toward {profile.goldWord}. It was never an object — it is the self that did this Work, and
        can do it again with whatever life brings next.
      </p>

      {r.essence.trim() && <blockquote className="al-essence">{r.essence.trim()}</blockquote>}
      {r.values.length > 0 && (
        <p className="al-stone-values">
          {r.values.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </p>
      )}

      <dl className="al-opus">
        {rows
          .filter(([, v]) => v && v.trim())
          .map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
      </dl>

      <div className="al-practice">
        <div className="al-practice-text">
          <span className="al-kicker">Each {r.when.toLowerCase()} · your daily gold</span>
          <p>{r.practice}</p>
        </div>
        <div className="al-week" aria-label={`Practiced ${run} day${run === 1 ? "" : "s"} in a row`}>
          {week.map((d) => (
            <span key={d.key} data-on={journey.practiceLog.includes(d.key)} data-today={d.key === today}>
              <i />
              {d.label}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="al-btn al-btn-primary"
          disabled={practiced}
          onClick={() => update((j) => ({ ...j, practiceLog: [...j.practiceLog.filter((k) => k !== today), today].slice(-120) }))}
        >
          {practiced ? "Practiced today ✓" : "I practiced today"}
        </button>
        <p className="al-note">
          {run > 0 ? `${run}-day streak. ` : ""}Return each day — gold is made by repetition, not revelation.
        </p>
      </div>

      <div className="al-stone-actions">
        <button type="button" className="al-btn al-btn-secondary al-btn-sm" onClick={copy}>
          {copied ? "Copied ✓" : "Copy my Great Work"}
        </button>
        <button type="button" className="al-btn al-btn-ghost al-btn-sm" onClick={() => go(1)}>
          Revisit the rites
        </button>
        {confirm ? (
          <span className="al-confirm">
            Erase everything?
            <button type="button" className="al-link" onClick={erase}>
              Yes, begin again
            </button>
            <button type="button" className="al-link" onClick={() => setConfirm(false)}>
              Keep it
            </button>
          </span>
        ) : (
          <button type="button" className="al-btn al-btn-ghost al-btn-sm" onClick={() => setConfirm(true)}>
            Begin a new Work
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- privacy + save state ---------- */

function LabFoot({ save, started, erase }: { save: SaveState; started: boolean; erase: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const label =
    save === "saving"
      ? "Saving…"
      : save === "saved"
        ? "Saved · private browser-linked copy ✓"
        : save === "local"
          ? "Saved on this device"
          : save === "error" ? "Not saved · keep this tab open" : "Private by design";
  return (
    <footer className="al-lab-foot">
      <span className="al-save" data-state={save}>
        <i aria-hidden="true" />
        {label}
      </span>
      <span>
        Your reflections are kept in this browser and under an anonymous key, so you can return to them. No account, no
        name required.
      </span>
      {started &&
        (confirm ? (
          <span className="al-confirm">
            <button
              type="button"
              className="al-link"
              onClick={() => {
                erase();
                setConfirm(false);
              }}
            >
              Yes, erase it all
            </button>
            <button type="button" className="al-link" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" className="al-link" onClick={() => setConfirm(true)}>
            Erase my Work
          </button>
        ))}
    </footer>
  );
}
