import { loadSamples } from "../src/lib/samples";
import { normalizeChart } from "../src/lib/model";
import { SIGNS, ASPECT_MAP } from "../src/lib/astro";
for (const s of loadSamples()) {
  const m = normalizeChart(s.chart);
  console.log(s.meta.name, "ASC", SIGNS[m.asc.sign].name, m.asc.text, "| Sun", m.byId.sun.signName, "Moon", m.byId.moon.signName,
    "| el", Object.entries(m.elements).map(([k, v]) => k[0] + v.count).join(""), "mod", Object.entries(m.modalities).map(([k, v]) => k[0] + v.count).join(""));
  console.log("  tightest:", m.aspects.filter(a => a.major).sort((a, b) => a.orb - b.orb).slice(0, 3).map(a => `${a.aId}-${ASPECT_MAP[a.type].name}-${a.bId} ${a.orb.toFixed(1)}`).join("; "), "| geom:", m.geometry.map(g => g.title).join("; "), "| conc:", m.concentrations.map(c => c.label + ":" + c.members.length).join(","));
  console.log("  moon-mars:", m.aspectBetween("moon", "mars")?.type ?? "none", "| sun-saturn:", m.aspectBetween("sun","saturn")?.type ?? "none");
}
