import { computeChart, type ChartData, type ChartInput } from "./astro";

export interface SampleMeta {
  id: string;
  name: string;
  tagline: string;
  input: ChartInput;
  note: string;
}

export const SAMPLES: SampleMeta[] = [
  {
    id: "maya", name: "Maya", tagline: "Early-summer chart · water emphasis, Libra rising",
    input: { name: "Maya", date: "1994-06-21", time: "14:32", timeKnown: true, placeId: "london", lat: 51.5074, lon: -0.1278, tz: "Europe/London", tzOffset: 0 },
    note: "Demonstration chart — solstice birth with a late-Gemini Sun.",
  },
  {
    id: "theo", name: "Theo", tagline: "Late-autumn chart · Sun–Pluto conjunction, Capricorn rising",
    input: { name: "Theo", date: "1988-11-05", time: "09:15", timeKnown: true, placeId: "sydney", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney", tzOffset: 0 },
    note: "Demonstration chart — southern-hemisphere morning birth.",
  },
  {
    id: "june", name: "June", tagline: "New-year chart · Sun–Saturn trine, a Moon T-square",
    input: { name: "June", date: "2000-01-01", time: "12:00", timeKnown: true, placeId: "new-york", lat: 40.7128, lon: -74.006, tz: "America/New_York", tzOffset: 0 },
    note: "Demonstration chart — millennium-day noon birth.",
  },
];

export interface LoadedSample { meta: SampleMeta; chart: ChartData }

let cache: LoadedSample[] | null = null;

export function loadSamples(): LoadedSample[] {
  if (cache) return cache;
  cache = SAMPLES.map((meta) => {
    const chart = computeChart(meta.input);
    chart.name = meta.name;
    return { meta, chart };
  });
  return cache;
}
