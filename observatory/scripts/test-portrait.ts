import { computeChart, CITIES, type ChartInput } from "../src/lib/astro";
import { loadSamples } from "../src/lib/samples";
import { buildCosmicPortrait } from "../src/lib/portrait/engine";
import { validateChart } from "../src/lib/model";

const city = (id: string) => { const c = CITIES.find((x) => x.id === id); if (!c) throw new Error("no city " + id); return c; };
const mk = (name: string, date: string, time: string, timeKnown: boolean, id: string): ChartInput => {
  const c = city(id);
  return { name, date, time, timeKnown, placeId: c.id, lat: c.lat, lon: c.lon, tz: c.tz, tzOffset: 0 };
};
const extra: { label: string; input: ChartInput }[] = [
  { label: "Priya (Mumbai, known)", input: mk("Priya", "1979-03-14", "06:45", true, process.argv[2] ?? "mumbai") },
  { label: "Marcus (Nairobi, known)", input: mk("Marcus", "2003-09-02", "21:10", true, "nairobi") },
  { label: "Eli (unknown time)", input: mk("Eli", "1991-12-22", "12:00", false, "new-york") },
];
const charts = [...loadSamples().map((s) => ({ label: s.meta.name + " (demo)", chart: s.chart, demo: true })),
  ...extra.map((e) => ({ label: e.label, chart: computeChart(e.input), demo: false }))];

const sents = (p: ReturnType<typeof buildCosmicPortrait>) => new Set(p.chapters.flatMap((c) => c.blocks).flatMap((b) => [b.text ?? "", ...(b.items ?? [])]).flatMap((t) => t.split(/(?<=[.!?])\s+/)).filter((s) => s.length > 40));
const portraits = charts.map((c) => ({ ...c, p: buildCosmicPortrait(c.chart, { isDemo: c.demo }) }));
for (const x of portraits) {
  const issues = validateChart(x.chart);
  console.log(`\n== ${x.label}: ${x.p.words} words · ${x.p.chapters.length} chapters · ${Object.keys(x.p.whys).length} why-refs · validate: ${issues.length ? issues.join("; ") : "ok"}`);
  console.log("   " + x.p.chapters.map((c) => `${c.number ?? 0}:${c.words}`).join("  "));
  console.log("   themes:", x.p.themes.join(", "));
}
console.log("\nSentence overlap between readings (Jaccard %, lower = more distinct):");
for (let i = 0; i < portraits.length; i++) for (let j = i + 1; j < portraits.length; j++) {
  const a = sents(portraits[i].p), b = sents(portraits[j].p);
  const inter = [...a].filter((s) => b.has(s)).length;
  console.log(`  ${portraits[i].label.split(" ")[0]} × ${portraits[j].label.split(" ")[0]}: ${(100 * inter / (a.size + b.size - inter)).toFixed(0)}%  (${inter} shared of ${a.size}/${b.size})`);
}
/* repetition inside one reading */
for (const x of portraits) {
  const all = x.p.chapters.flatMap((c) => c.blocks).flatMap((b) => [b.text ?? "", ...(b.items ?? [])]).flatMap((t) => t.split(/(?<=[.!?])\s+/)).filter((s) => s.length > 40);
  const dup = all.filter((s, i) => all.indexOf(s) !== i);
  if (dup.length) console.log(`  DUPLICATE sentences in ${x.label}:`, dup);
}
if (process.argv.includes("--dump")) {
  const idx = Number(process.argv[process.argv.indexOf("--dump") + 1] ?? 0);
  const x = portraits[idx];
  console.log(`\n\n######## ${x.label}\n`);
  for (const ch of x.p.chapters) {
    console.log(`\n## ${ch.kicker} — ${ch.title}  [${ch.words}w]`);
    for (const b of ch.blocks) { console.log(`\n(${b.type}${b.why ? " why:" + b.why.join(",") : ""}) ${b.text ?? ""}`); (b.items ?? []).forEach((i) => console.log("   - " + i)); }
  }
}
