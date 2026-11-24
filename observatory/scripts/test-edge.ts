import { computeChart, fmtDegMin, degMinOf, validateChartInput, type ChartInput } from "../src/lib/astro";
import { buildCosmicPortrait } from "../src/lib/portrait/engine";
const base: ChartInput = { name: "T", date: "1990-01-01", time: "12:00", timeKnown: true, placeId: "custom", lat: 40, lon: -74, tz: "America/New_York", tzOffset: 0 };
// degree formatting near boundaries
for (const l of [29.99999, 59.9999, 89.995, 359.99999, 0, 30, 0.0001, 119.9999]) console.log("fmt", l, fmtDegMin(l), JSON.stringify(degMinOf(l)));
// polar
const polar = computeChart({ ...base, lat: 69.65, lon: 18.96, tz: "Europe/Oslo" });
console.log("polar:", polar.houseSystem, polar.ascLon.toFixed(1), polar.houseNote);
const pp = buildCosmicPortrait(polar);
console.log("polar words", pp.words, "|", pp.accuracy.lines.filter((l) => /equal|latitude/i.test(l)).join(" // "));
console.log("polar sun house sentence:", pp.chapters[1].blocks.map((b) => b.text).join(" ").includes("simplified equal-house"));
// DST gap & overlap (US 2023-03-12 02:30 gap; 2023-11-05 01:30 overlap)
const gap = computeChart({ ...base, date: "2023-03-12", time: "02:30" });
const ov = computeChart({ ...base, date: "2023-11-05", time: "01:30" });
console.log("gap notes:", gap.timeNotes); console.log("overlap notes:", ov.timeNotes);
// date label stays the entered date (11:30pm New York is next day in UTC)
console.log("date label:", computeChart({ ...base, date: "1990-06-15", time: "23:30" }).dateLabel);
// unknown time + sign boundary: find a date where Moon changes sign within the day
let found = 0;
for (let d = 1; d < 40 && found < 2; d++) {
  const dt = `1991-03-${String(d).padStart(2, "0")}`;
  if (d > 31) break;
  const c = computeChart({ ...base, date: dt, timeKnown: false });
  if (c.planets[1].signUncertain) {
    found++;
    const pr = buildCosmicPortrait(c);
    console.log(dt, "moon uncertain → alt", c.planets[1].altSign, "| noting:", pr.chapters[3].blocks.some((b) => b.type === "note" && /changed sign/.test(b.text ?? "")), "| rising chapter says unavailable:", /does not assign/.test(pr.chapters[2].blocks[0].text ?? ""), "| moon aspect omitted:", pr.chapters[3].blocks.some((b) => /left out of this reading/.test(b.text ?? "")));
    const txt = pr.chapters.flatMap((c) => c.blocks).map((b) => b.text ?? "").join(" ");
    console.log("   leaks houses/rising as fact?", /in your (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) house/.test(txt), /rising sign is [A-Z]/.test(txt), "words", pr.words);
  }
}
// sun on cusp unknown time
for (const dt of ["1990-03-20", "1990-03-21", "1990-06-21", "1990-09-23", "1990-12-22"]) { const c = computeChart({ ...base, date: dt, timeKnown: false }); if (c.planets[0].signUncertain) console.log(dt, "SUN uncertain alt", c.planets[0].altSign, buildCosmicPortrait(c).chapters[1].blocks.some((b) => /changed sign/.test(b.text ?? ""))); }
// validation
console.log(validateChartInput({ ...base, date: "2023-02-30" }), "|", validateChartInput({ ...base, lat: 95 }), "|", validateChartInput({ ...base, date: "1700-01-01" }), "|", validateChartInput(base));
