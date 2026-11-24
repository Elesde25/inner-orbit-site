"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import type { StageSceneHandle } from "./StageScene";
import {
  FEELINGS,
  POLARITIES,
  VALUES,
  WHEN,
  balanceScore,
  beliefsFor,
  draftEssence,
  polarityReading,
  practicesFor,
  type Journey,
  type Profile,
} from "./data";

export type RiteProps = {
  journey: Journey;
  profile: Profile;
  setRite: (patch: Partial<Journey["rites"]>) => void;
  scene: RefObject<StageSceneHandle | null>;
  onSeal?: () => void;
};

export function riteDone(stage: number, j: Journey): boolean {
  const r = j.rites;
  switch (stage) {
    case 0:
      return r.burned;
    case 1:
      return r.breathed && r.feelings.length > 0;
    case 2:
      return r.sorted.length >= 6;
    case 3:
      return r.shadow.trim().length > 0;
    case 4:
      return r.reborn;
    case 5:
      return r.values.length === 3 && r.essence.trim().length > 0;
    default:
      return j.completedAt !== null;
  }
}

/* ---------- shared atoms ---------- */

export function Chip({
  on,
  onClick,
  disabled,
  children,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" className="al-chip" aria-pressed={on} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="al-field">
      <p className="al-field-label">{label}</p>
      {hint && <p className="al-field-hint">{hint}</p>}
      {children}
    </div>
  );
}

/** Press-and-hold control: the ring fills while held and drains when released. */
export function HoldButton({
  seconds,
  label,
  disabled,
  onProgress,
  onComplete,
}: {
  seconds: number;
  label: string;
  disabled?: boolean;
  onProgress?: (p: number) => void;
  onComplete: () => void;
}) {
  const [p, setP] = useState(0);
  const st = useRef({ holding: false, p: 0, raf: 0, last: 0, done: false });
  const cb = useRef({ onProgress, onComplete });
  useEffect(() => {
    cb.current = { onProgress, onComplete };
  });
  useEffect(() => {
    const s = st.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  const loop = (now: number) => {
    const s = st.current;
    const dt = Math.min(0.12, (now - s.last) / 1000);
    s.last = now;
    s.p = Math.min(1, Math.max(0, s.p + (s.holding ? dt / seconds : -dt * 1.3)));
    setP(s.p);
    cb.current.onProgress?.(s.p);
    if (s.p >= 1 && !s.done) {
      s.done = true;
      s.holding = false;
      s.raf = 0;
      cb.current.onComplete();
      return;
    }
    s.raf = s.holding || s.p > 0 ? requestAnimationFrame(loop) : 0;
  };
  const start = () => {
    const s = st.current;
    if (disabled || s.done) return;
    s.holding = true;
    if (!s.raf) {
      s.last = performance.now();
      s.raf = requestAnimationFrame(loop);
    }
  };
  const stop = () => {
    st.current.holding = false;
  };

  return (
    <button
      type="button"
      className="al-hold"
      disabled={disabled}
      data-holding={p > 0}
      style={{ "--p": p } as CSSProperties}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={stop}
      onBlur={stop}
    >
      <span className="al-hold-fill" aria-hidden="true" />
      <span className="al-hold-label">{label}</span>
      <span className="al-hold-pct" aria-hidden="true">
        {Math.round(p * 100)}%
      </span>
    </button>
  );
}

function Outcome({ children }: { children: ReactNode }) {
  return <div className="al-outcome">{children}</div>;
}

/* ---------- 1 · Calcination ---------- */

export function Calcination({ journey, profile, setRite, scene }: RiteProps) {
  const r = journey.rites;
  useEffect(() => {
    const s = scene.current;
    return () => s?.setEnergy(0);
  }, [scene]);

  return (
    <div className="al-rite">
      <Field
        label="Which identity, story or habit has outlived its usefulness?"
        hint="Choose one that stings a little — or name it in your own words."
      >
        <div className="al-chips">
          {profile.metal.falseSelves.map((s) => (
            <Chip key={s} on={r.burn === s} disabled={r.burned} onClick={() => setRite({ burn: s })}>
              {s}
            </Chip>
          ))}
        </div>
        <input
          className="al-input"
          value={r.burn}
          disabled={r.burned}
          maxLength={120}
          aria-label="What you are ready to burn"
          placeholder="e.g. The one who must never disappoint anyone"
          onChange={(e) => setRite({ burn: e.target.value })}
        />
      </Field>

      {!r.burned ? (
        <>
          <HoldButton
            seconds={3.2}
            label="Press & hold to stoke the fire"
            disabled={!r.burn.trim()}
            onProgress={(p) => scene.current?.setEnergy(p * 1.5)}
            onComplete={() => {
              scene.current?.pulse(1);
              scene.current?.setEnergy(0.3);
              setRite({ burned: true });
            }}
          />
          <p className="al-note">Hold steadily. If you let go early, the fire dies back — as it does in life.</p>
        </>
      ) : (
        <Outcome>
          <p className="al-ash">“{r.burn}”</p>
          <p>It is ash now. Whatever is still standing in you could not burn — that part is real.</p>
          <button type="button" className="al-link" onClick={() => setRite({ burned: false })}>
            Burn something else
          </button>
        </Outcome>
      )}
    </div>
  );
}

/* ---------- 2 · Dissolution ---------- */

const CYCLES = 3;
const easeIO = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function Dissolution({ journey, setRite, scene }: RiteProps) {
  const r = journey.rites;
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [cycle, setCycle] = useState(0);
  const orb = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const done = useRef(setRite);
  useEffect(() => {
    done.current = setRite;
  });

  useEffect(() => {
    if (!running) return;
    const s = scene.current;
    const t0 = performance.now();
    let raf = 0;
    let lastKey = "";
    const tick = (now: number) => {
      const el = (now - t0) / 1000;
      const c = Math.floor(el / 10);
      if (c >= CYCLES) {
        s?.setScale(1);
        s?.pulse(0.8);
        setRunning(false);
        done.current({ breathed: true });
        return;
      }
      const u = el - c * 10;
      const inhale = u < 4;
      const k = inhale ? easeIO(u / 4) : 1 - easeIO((u - 4) / 6);
      s?.setScale(0.86 + 0.36 * k);
      if (orb.current) orb.current.style.transform = `scale(${(0.6 + 0.4 * k).toFixed(3)})`;
      if (count.current) count.current.textContent = String(Math.ceil(inhale ? 4 - u : 10 - u));
      const key = `${c}${inhale}`;
      if (key !== lastKey) {
        lastKey = key;
        setPhase(inhale ? "in" : "out");
        setCycle(c);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      s?.setScale(1);
    };
  }, [running, scene]);

  const toggle = (f: string) => {
    const has = r.feelings.includes(f);
    if (has) setRite({ feelings: r.feelings.filter((x) => x !== f) });
    else if (r.feelings.length < 3) setRite({ feelings: [...r.feelings, f] });
  };

  return (
    <div className="al-rite">
      {!r.breathed ? (
        <div className="al-breath" data-running={running}>
          <div className="al-breath-ring">
            <div className="al-breath-orb" ref={orb} />
            <div className="al-breath-text">
              {running ? (
                <>
                  <strong>{phase === "in" ? "Breathe in" : "Let it go"}</strong>
                  <span ref={count}>4</span>
                </>
              ) : (
                <strong>Three breaths</strong>
              )}
            </div>
          </div>
          <div className="al-breath-side">
            <p className="al-field-label">Water does not force. It softens.</p>
            <p className="al-field-hint">
              Breathe in for four as the water swells, out for six as it settles. Three rounds — thirty seconds.
            </p>
            {running ? (
              <p className="al-note">
                Round {cycle + 1} of {CYCLES}
              </p>
            ) : (
              <button type="button" className="al-btn al-btn-secondary al-btn-sm" onClick={() => setRunning(true)}>
                Begin breathing
              </button>
            )}
            <button type="button" className="al-link" onClick={() => setRite({ breathed: true })}>
              I have already slowed down — continue
            </button>
          </div>
        </div>
      ) : (
        <Field
          label="With the armour softened — what feeling surfaces?"
          hint="Choose up to three. Nothing here needs fixing; it only needs to be let through."
        >
          <div className="al-chips">
            {FEELINGS.map((f) => (
              <Chip key={f} on={r.feelings.includes(f)} onClick={() => toggle(f)}>
                {f}
              </Chip>
            ))}
          </div>
          {r.feelings.length > 0 && (
            <Outcome>
              <p>
                {r.feelings.join(", ")}. {r.feelings.length > 1 ? "These were" : "This was"} underneath the whole
                time. Let {r.feelings.length > 1 ? "them" : "it"} move through like water — you do not have to become{" "}
                {r.feelings.length > 1 ? "them" : "it"}.
              </p>
            </Outcome>
          )}
        </Field>
      )}
    </div>
  );
}

/* ---------- 3 · Separation ---------- */

export function Separation({ journey, profile, setRite, scene }: RiteProps) {
  const beliefs = useMemo(() => beliefsFor(profile), [profile]);
  const sorted = journey.rites.sorted;
  const i = sorted.length;
  const finished = i >= beliefs.length;

  useEffect(() => {
    scene.current?.setEnergy(finished ? 0.35 : 0);
    const s = scene.current;
    return () => s?.setEnergy(0);
  }, [finished, scene]);

  const choose = (keep: boolean) => {
    scene.current?.pulse(keep ? 0.7 : 0.35);
    setRite({ sorted: [...sorted, { text: beliefs[i], keep }] });
  };

  if (!finished) {
    return (
      <div className="al-rite">
        <Field
          label="Hold each belief up to the light. Is it truly yours?"
          hint="There are no right answers. Trust the first honest reaction in your body."
        >
          <div className="al-belief" key={i}>
            <span className="al-kicker">
              Belief {i + 1} of {beliefs.length}
            </span>
            <p>“{beliefs[i]}”</p>
          </div>
          <div className="al-belief-actions">
            <button type="button" className="al-btn al-btn-secondary" onClick={() => choose(false)}>
              <span aria-hidden="true">↓</span> Release — it was handed to me
            </button>
            <button type="button" className="al-btn al-btn-primary" onClick={() => choose(true)}>
              <span aria-hidden="true">↑</span> Keep — this is mine
            </button>
          </div>
          <div className="al-pips" aria-hidden="true">
            {beliefs.map((_, k) => (
              <i key={k} data-state={k < i ? (sorted[k].keep ? "keep" : "release") : k === i ? "now" : ""} />
            ))}
          </div>
        </Field>
      </div>
    );
  }

  const kept = sorted.filter((s) => s.keep);
  const released = sorted.filter((s) => !s.keep);
  return (
    <div className="al-rite">
      <div className="al-sorted">
        <div data-kind="keep">
          <span className="al-kicker">Essence · I keep</span>
          {kept.length ? kept.map((s) => <p key={s.text}>{s.text}</p>) : <p className="al-muted">Nothing yet — add one below.</p>}
        </div>
        <div data-kind="release">
          <span className="al-kicker">Dross · I release</span>
          {released.length ? released.map((s) => <p key={s.text}>{s.text}</p>) : <p className="al-muted">Nothing released.</p>}
        </div>
      </div>
      <Field label="One thing I know is truly mine:" hint="Optional — in your own words.">
        <input
          className="al-input"
          value={journey.rites.truth}
          maxLength={140}
          aria-label="One thing that is truly mine"
          placeholder="e.g. I love deeply, and that is not a weakness"
          onChange={(e) => setRite({ truth: e.target.value })}
        />
      </Field>
      <button type="button" className="al-link" onClick={() => setRite({ sorted: [] })}>
        Sort again
      </button>
    </div>
  );
}

/* ---------- 4 · Conjunction ---------- */

export function Conjunction({ journey, profile, setRite, scene }: RiteProps) {
  const r = journey.rites;
  const score = balanceScore(r.balance);

  useEffect(() => {
    scene.current?.setEnergy(0.15 + score * 0.6);
  }, [score, scene]);
  useEffect(() => {
    const s = scene.current;
    return () => s?.setEnergy(0);
  }, [scene]);

  const setBalance = (i: number, v: number) => {
    const next = [...r.balance];
    next[i] = v;
    setRite({ balance: next });
  };

  return (
    <div className="al-rite">
      <Field label="Where do you live today, between each pair?" hint="Slide honestly. Neither end is the right answer — the marriage is.">
        <div className="al-polarities">
          {POLARITIES.map(([a, b], i) => (
            <div className="al-polarity" key={a}>
              <div className="al-polarity-ends">
                <span>{a}</span>
                <span>{b}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={r.balance[i] ?? 50}
                className="al-range"
                aria-label={`${a} to ${b}`}
                style={{ "--v": `${r.balance[i] ?? 50}%` } as CSSProperties}
                onChange={(e) => setBalance(i, Number(e.target.value))}
              />
              <p className="al-reading">{polarityReading(i, r.balance[i] ?? 50)}</p>
            </div>
          ))}
        </div>
      </Field>

      <Field label="A part of myself I have pushed away:" hint="The shadow is not the enemy of the gold. It is the half of it you have not claimed.">
        <div className="al-chips">
          {profile.metal.rejected.map((s) => (
            <Chip key={s} on={r.shadow === s} onClick={() => setRite({ shadow: s })}>
              {s}
            </Chip>
          ))}
        </div>
        <input
          className="al-input"
          value={r.shadow}
          maxLength={80}
          aria-label="A part of myself I have pushed away"
          placeholder="e.g. My ambition"
          onChange={(e) => setRite({ shadow: e.target.value })}
        />
        <input
          className="al-input"
          value={r.shadowGift}
          maxLength={120}
          aria-label="The gift hidden inside it"
          placeholder="…and the gift hidden inside it (e.g. it protects what matters to me)"
          onChange={(e) => setRite({ shadowGift: e.target.value })}
        />
      </Field>

      {r.shadow.trim() && (
        <Outcome>
          <p>
            {r.shadow.trim()} is welcome back at the table
            {r.shadowGift.trim() ? ` — ${r.shadowGift.trim().replace(/\.$/, "")}` : ""}. What you stop fighting, you
            can finally use.
          </p>
        </Outcome>
      )}
    </div>
  );
}

/* ---------- 5 · Fermentation ---------- */

export function Fermentation({ journey, profile, setRite, scene }: RiteProps) {
  const r = journey.rites;
  useEffect(() => {
    scene.current?.setBright(r.reborn ? 1 : 0.3);
    const s = scene.current;
    return () => {
      s?.setBright(1);
      s?.setEnergy(0);
    };
  }, [r.reborn, scene]);

  const canLight = r.noLonger.trim().length > 0 && r.becoming.trim().length > 0;
  const becomingHint = `someone who lives with ${profile.goldWord}`;

  return (
    <div className="al-rite">
      <Field label="I am no longer…" hint="Let the old self be named, so it can be laid down.">
        <input
          className="al-input"
          value={r.noLonger}
          disabled={r.reborn}
          maxLength={120}
          aria-label="I am no longer"
          placeholder={r.burn.trim() ? `e.g. ${r.burn.trim().replace(/^The /, "the ")}` : "e.g. the one who waits for permission"}
          onChange={(e) => setRite({ noLonger: e.target.value })}
        />
      </Field>
      <Field label="I am becoming…" hint="Not a plan. A direction of growth.">
        <input
          className="al-input"
          value={r.becoming}
          disabled={r.reborn}
          maxLength={120}
          aria-label="I am becoming"
          placeholder={`e.g. ${becomingHint}`}
          onChange={(e) => setRite({ becoming: e.target.value })}
        />
        {!r.becoming.trim() && !r.reborn && (
          <button type="button" className="al-link" onClick={() => setRite({ becoming: becomingHint })}>
            Use “{becomingHint}”
          </button>
        )}
      </Field>

      {!r.reborn ? (
        <>
          <button
            type="button"
            className="al-btn al-btn-primary"
            disabled={!canLight}
            onClick={() => {
              scene.current?.setBright(1);
              scene.current?.pulse(1.1);
              scene.current?.setEnergy(0.5);
              setRite({ reborn: true });
            }}
          >
            Let the light in
          </button>
          <p className="al-note">The vessel is dark on purpose. Rebirth always begins as a darkness.</p>
        </>
      ) : (
        <Outcome>
          <p className="al-ash al-ash-light">I am becoming {r.becoming.trim().replace(/\.$/, "")}.</p>
          <p>The Peacock’s Tail: colour returning to what looked finished. Stay with it for a breath.</p>
          <button type="button" className="al-link" onClick={() => setRite({ reborn: false })}>
            Rewrite this
          </button>
        </Outcome>
      )}
    </div>
  );
}

/* ---------- 6 · Distillation ---------- */

export function Distillation({ journey, setRite, scene }: RiteProps) {
  const r = journey.rites;
  const toggle = (v: string) => {
    if (r.values.includes(v)) setRite({ values: r.values.filter((x) => x !== v) });
    else if (r.values.length < 3) {
      scene.current?.pulse(0.5);
      setRite({ values: [...r.values, v] });
    }
  };
  const draft = draftEssence(journey);

  return (
    <div className="al-rite">
      <Field
        label="Of everything you could be — which three are essential?"
        hint={`Exactly three. Distillation is the art of leaving things out. (${r.values.length}/3)`}
      >
        <div className="al-chips">
          {VALUES.map((v) => (
            <Chip key={v} on={r.values.includes(v)} disabled={!r.values.includes(v) && r.values.length >= 3} onClick={() => toggle(v)}>
              {v}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Now reduce your whole Work to a single line." hint="One sentence you could carry in a pocket.">
        <textarea
          className="al-input al-textarea"
          value={r.essence}
          maxLength={180}
          rows={3}
          aria-label="My essence, in one line"
          placeholder="e.g. I release the mask. I keep my tenderness. I am becoming someone who rests."
          onChange={(e) => setRite({ essence: e.target.value })}
        />
        <div className="al-field-row">
          {draft ? (
            <button type="button" className="al-link" onClick={() => setRite({ essence: draft.slice(0, 180) })}>
              Draft it from my answers
            </button>
          ) : (
            <span />
          )}
          <span className="al-counter">{r.essence.length}/180</span>
        </div>
      </Field>
    </div>
  );
}

/* ---------- 7 · Coagulation ---------- */

export function Coagulation({ journey, profile, setRite, scene, onSeal }: RiteProps) {
  const r = journey.rites;
  const options = useMemo(() => practicesFor(profile), [profile]);
  useEffect(() => {
    const s = scene.current;
    return () => s?.setEnergy(0);
  }, [scene]);

  return (
    <div className="al-rite">
      <Field
        label="Choose one small practice to give your gold a body."
        hint="Small enough that you cannot fail. These were chosen for your metal, catalyst and intention."
      >
        <div className="al-options">
          {options.map((o) => (
            <button key={o} type="button" className="al-option" aria-pressed={r.practice === o} onClick={() => setRite({ practice: o })}>
              <i aria-hidden="true" />
              {o}
            </button>
          ))}
        </div>
        <input
          className="al-input"
          value={r.practice}
          maxLength={140}
          aria-label="My daily practice"
          placeholder="…or write your own"
          onChange={(e) => setRite({ practice: e.target.value })}
        />
      </Field>

      <Field label="When will it live in your day?">
        <div className="al-chips">
          {WHEN.map((w) => (
            <Chip key={w} on={r.when === w} onClick={() => setRite({ when: w })}>
              {w}
            </Chip>
          ))}
        </div>
      </Field>

      <HoldButton
        seconds={2.6}
        label="Press & hold to seal the Stone"
        disabled={!r.practice.trim()}
        onProgress={(p) => scene.current?.setEnergy(p * 1.2)}
        onComplete={() => {
          scene.current?.pulse(1.2);
          scene.current?.setEnergy(0.2);
          onSeal?.();
        }}
      />
    </div>
  );
}
