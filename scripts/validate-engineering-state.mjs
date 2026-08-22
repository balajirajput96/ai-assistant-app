import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stateDir = join(root, "automation", "continuation", "state");
const cyclesDir = join(stateDir, "cycles");
const latestPath = join(stateDir, "latest.json");
const summaryPath = join(stateDir, "summary.tsv");

if (!existsSync(latestPath) || !existsSync(summaryPath) || !existsSync(cyclesDir)) throw new Error("Continuation state has not been initialized. Run pnpm engineering:cycle first.");
const latest = JSON.parse(readFileSync(latestPath, "utf8"));
const records = readdirSync(cyclesDir).filter((file) => /^cycle-\d+\.json$/.test(file)).map((file) => JSON.parse(readFileSync(join(cyclesDir, file), "utf8"))).sort((a, b) => a.cycle - b.cycle);
if (!records.length) throw new Error("No immutable cycle records were found.");
for (let index = 0; index < records.length; index += 1) {
  const expected = index + 1;
  if (records[index].cycle !== expected) throw new Error(`Cycle sequence is not contiguous at ${records[index].cycle}; expected ${expected}.`);
}
const last = records.at(-1);
if (latest.cycle !== last.cycle) throw new Error("latest.json does not match the newest immutable cycle.");
const summary = readFileSync(summaryPath, "utf8").trim().split("\n");
if (summary.length !== records.length + 1) throw new Error("summary.tsv row count does not match immutable cycle count.");
console.log(JSON.stringify({ stateContract: "passed", cycles: records.length, latestCycle: latest.cycle, latestStatus: latest.status }, null, 2));
