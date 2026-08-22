import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const automationDir = join(root, "automation", "continuation");
const configPath = join(automationDir, "config.json");
const stateDir = join(automationDir, "state");
const cyclesDir = join(stateDir, "cycles");
const latestPath = join(stateDir, "latest.json");
const summaryPath = join(stateDir, "summary.tsv");
const config = JSON.parse(readFileSync(configPath, "utf8"));

function safeReadJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function redact(value = "") {
  return String(value)
    .replace(/(?:gh[pousr]_[A-Za-z0-9]{10,}|github_pat_[A-Za-z0-9_]{10,}|sk-(?:proj-)?[A-Za-z0-9_-]{10,}|AKIA[0-9A-Z]{16})/g, "[REDACTED]")
    .replace(/(Authorization:\s*Bearer\s+)[^\s]+/gi, "$1[REDACTED]")
    .slice(-2400);
}

function execute(name, command, args) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    timeout: 5 * 60 * 1000,
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
  });
  return {
    name,
    command: [command, ...args].join(" "),
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.status ?? 1,
    signal: result.signal ?? null,
    outputTail: redact(`${result.stdout ?? ""}\n${result.stderr ?? ""}`),
  };
}

function gitValue(args, fallback = "unknown") {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim() || fallback;
  } catch {
    return fallback;
  }
}

function rebuildSummary(records) {
  const header = "cycle\tstarted_at\tfinished_at\tstatus\tpassed\tfailed\trepair_attempted\n";
  const rows = records
    .sort((a, b) => a.cycle - b.cycle)
    .map((record) => [record.cycle, record.startedAt, record.finishedAt, record.status, record.validation.passed, record.validation.failed, record.repair.attempted].join("\t"));
  writeFileSync(summaryPath, `${header}${rows.join("\n")}\n`);
}

mkdirSync(cyclesDir, { recursive: true });
const latest = safeReadJson(latestPath, { cycle: 0 });
const previousCycle = Number(latest.cycle || 0);
const cycle = previousCycle + 1;
const startedAt = new Date().toISOString();
const cyclePath = join(cyclesDir, `cycle-${String(cycle).padStart(4, "0")}.json`);

const record = {
  schemaVersion: 1,
  cycle,
  maxCycles: Number(config.maxCycles || 2400),
  mode: config.mode || "diagnostics-first",
  startedAt,
  finishedAt: startedAt,
  status: "started",
  previousCycle,
  environment: {
    gitHead: gitValue(["rev-parse", "HEAD"]),
    gitBranch: gitValue(["branch", "--show-current"]),
    gitStatus: redact(gitValue(["status", "--short"], "")),
  },
  actions: [{ type: "load_previous_state", result: previousCycle ? "completed" : "initialized" }],
  validation: { passed: 0, failed: 0, steps: [] },
  repair: { attempted: false, result: "not-needed", steps: [] },
  publication: config.publication,
  errors: [],
};

if (previousCycle >= record.maxCycles) {
  record.status = "cycle_limit_reached";
  record.finishedAt = new Date().toISOString();
} else {
  const firstPass = config.validationCommands.map((step) => execute(step.name, step.command, step.args));
  record.validation.steps.push(...firstPass);
  let failed = firstPass.filter((step) => step.exitCode !== 0);

  if (failed.length && Number(config.retryPolicy?.maxValidationRetries || 0) > 0) {
    record.repair.attempted = true;
    const dependencyRepair = execute("dependency-repair", "pnpm", ["install", "--frozen-lockfile"]);
    record.repair.steps.push(dependencyRepair);
    if (dependencyRepair.exitCode === 0) {
      const retrySteps = failed.map((failedStep) => {
        const definition = config.validationCommands.find((step) => step.name === failedStep.name);
        return execute(`${failedStep.name}-retry`, definition.command, definition.args);
      });
      record.validation.steps.push(...retrySteps);
      failed = retrySteps.filter((step) => step.exitCode !== 0);
      record.repair.result = failed.length ? "validation-still-failing" : "dependency-repair-restored-validation";
    } else {
      record.repair.result = "dependency-repair-failed";
    }
  }

  record.validation.passed = record.validation.steps.filter((step) => step.exitCode === 0).length;
  record.validation.failed = record.validation.steps.filter((step) => step.exitCode !== 0).length;
  record.status = failed.length ? "validation_failed" : "completed";
  if (failed.length) record.errors.push({ type: "validation", failedSteps: failed.map((step) => step.name) });
  record.actions.push({ type: "validate", result: record.status });
  record.finishedAt = new Date().toISOString();
}

writeFileSync(cyclePath, `${JSON.stringify(record, null, 2)}\n`);
writeFileSync(latestPath, `${JSON.stringify(record, null, 2)}\n`);
const records = readdirSync(cyclesDir).filter((file) => /^cycle-\d+\.json$/.test(file)).map((file) => safeReadJson(join(cyclesDir, file), null)).filter(Boolean);
rebuildSummary(records);
console.log(JSON.stringify({ cycle: record.cycle, status: record.status, validation: record.validation, repair: record.repair }, null, 2));
process.exitCode = record.status === "completed" || record.status === "cycle_limit_reached" ? 0 : 1;
