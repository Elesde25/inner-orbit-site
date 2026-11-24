"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blankJourney, type Journey } from "./data";

const KEY = "inner-orbit:alchemy:journey:v1";

export type SaveState = "idle" | "saving" | "saved" | "local" | "error";

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10).join("")}`;
}

function normalize(raw: unknown): Journey | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<Journey>;
  if (r.v !== 1 || typeof r.id !== "string" || !r.id) return null;
  const b = blankJourney(r.id);
  return {
    ...b,
    ...r,
    intake: { ...b.intake, ...(r.intake ?? {}) },
    rites: { ...b.rites, ...(r.rites ?? {}) },
    practiceLog: Array.isArray(r.practiceLog) ? r.practiceLog : [],
  } as Journey;
}

/**
 * The visitor's Great Work. Written to this browser on every change, and mirrored
 * (debounced) to the server under an anonymous id so it survives a cleared tab.
 */
export function useJourney() {
  const [journey, setJourney] = useState<Journey>(() => blankJourney());
  const [ready, setReady] = useState(false);
  const [save, setSave] = useState<SaveState>("idle");
  const dirty = useRef(false);
  const accountHydrated = useRef(false);
  const idRef = useRef("");

  useEffect(() => {
    idRef.current = journey.id;
  }, [journey.id]);

  useEffect(() => {
    const restoreAccountJourney = (event: Event) => {
      const detail = (event as CustomEvent<{ keys?: string[] }>).detail;
      if (!detail?.keys?.includes(KEY) || dirty.current) return;
      try {
        const restored = normalize(JSON.parse(window.localStorage.getItem(KEY) ?? "null"));
        if (restored) {
          accountHydrated.current = true;
          idRef.current = restored.id;
          setJourney(restored);
        }
      } catch {
        /* Keep the in-memory journey if restored browser data is malformed. */
      }
    };
    window.addEventListener("io-account-data-hydrated", restoreAccountJourney);
    let local: Journey | null = null;
    try {
      local = normalize(JSON.parse(window.localStorage.getItem(KEY) ?? "null"));
    } catch {
      local = null;
    }
    const start = local ?? blankJourney(uuid());
    setJourney(start);
    setReady(true);
    let cancelled = false;
    fetch(local ? `/api/journey?id=${encodeURIComponent(start.id)}` : "/api/journey")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        const d = data as { journey?: unknown } | null;
        const remote = normalize(d?.journey);
        if (!cancelled && remote && (!local || remote.updatedAt > start.updatedAt) && !dirty.current && !accountHydrated.current) setJourney(remote);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      window.removeEventListener("io-account-data-hydrated", restoreAccountJourney);
    };
  }, []);

  useEffect(() => {
    if (!ready || !dirty.current) return;
    let localSaved=false;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(journey));
      localSaved=true;
    } catch {
      /* storage may be unavailable (private mode); the server copy still applies */
    }
    setSave("saving");
    const timer = window.setTimeout(() => {
      fetch("/api/journey", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journey }),
      })
        .then((r) => setSave(r.ok ? "saved" : localSaved ? "local" : "error"))
        .catch(() => setSave(localSaved ? "local" : "error"));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [journey, ready]);

  const update = useCallback((fn: (j: Journey) => Journey) => {
    dirty.current = true;
    setJourney((prev) => ({ ...fn(prev), updatedAt: Date.now() }));
  }, []);

  const erase = useCallback(async () => {
    const id = idRef.current;
    if (id) {
      try { const response=await fetch(`/api/journey?id=${encodeURIComponent(id)}`, { method: "DELETE" }); if(!response.ok) throw new Error("Erase failed"); }
      catch { setSave("error"); return; }
    }
    setJourney(blankJourney(uuid()));
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* nothing to remove */
    }
    dirty.current = false;
    setSave("idle");
  }, []);

  return { journey, ready, save, update, erase };
}
