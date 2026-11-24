import { loadSamples } from "../src/lib/samples";
for (const s of loadSamples()) {
  const c = s.chart;
  console.log(s.meta.id, c.ascLon.toFixed(3), c.mcLon.toFixed(3), c.planets.map(p => p.lon.toFixed(3)+"/"+p.house).join(" "));
}
