import type { Selection } from "../model";

/** One line of "here is where this comes from" shown by Show Me Why. */
export interface WhyFact { label: string; value: string }

export interface WhyRef {
  id: string;
  kind: "planet" | "aspect" | "house" | "angle" | "pattern" | "element" | "phase" | "ruler";
  title: string;
  glyph?: string;
  color?: string;
  facts: WhyFact[];
  /** the traditional association, in plain words */
  tradition: string;
  /** reliability caveat (unknown birth time, polar fallback, …) */
  caveat?: string;
  firmness: "firm" | "approximate" | "unknown";
  /** drives the existing synchronized selection system (3D, 2D, panel) */
  selection: Selection | null;
  spotlight: { planets: number[]; aspects: number[] } | null;
}

export type BlockType = "p" | "lead" | "note" | "questions" | "list" | "pull";

export interface PortraitBlock {
  id: string;
  type: BlockType;
  text?: string;
  items?: string[];
  /** ids into CosmicPortrait.whys */
  why?: string[];
}

export interface PortraitChapter {
  id: string;
  /** null for the opening */
  number: number | null;
  kicker: string;
  title: string;
  glyph: string;
  color: string;
  blurb: string;
  blocks: PortraitBlock[];
  words: number;
}

export interface PortraitAccuracy {
  demoChart: boolean;
  timeKnown: boolean;
  ephemerisName: string;
  ephemerisVerified: boolean;
  houseSystem: "placidus" | "equal";
  /** plain-language statements, most important first */
  lines: string[];
  /** parts of the reading that cannot be reliably determined */
  unavailable: string[];
}

export interface CosmicPortrait {
  title: string;
  subtitle: string;
  name: string;
  /** stable id for this exact chart — used to keep reading progress from leaking between people */
  fingerprint: string;
  chapters: PortraitChapter[];
  whys: Record<string, WhyRef>;
  words: number;
  minutes: number;
  accuracy: PortraitAccuracy;
  engine: { id: string; version: string };
  /** theme ids the engine chose to emphasize (useful for tests / future AI) */
  themes: string[];
}

/**
 * Optional enhancement hook. A future AI service can rewrite a chapter's
 * prose while being handed the same calculated facts. The deterministic
 * engine never depends on it; if it returns null the original is kept.
 */
export interface NarrativeProvider {
  id: string;
  enhanceChapter(chapter: PortraitChapter, context: { facts: WhyRef[]; portrait: CosmicPortrait }): Promise<PortraitChapter | null>;
}
