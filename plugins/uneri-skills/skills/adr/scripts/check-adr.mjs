// Mechanical ADR checks (the `M` rules of adr-authoring). The `J` rules are judged by the skill's steps in SKILL.md.
// Usage: node check-adr.mjs [ADR directory] [--from NNNN]
//   Without a directory, CANDIDATE_DIRS are searched in order; exit 2 if none holds ADR files.
//   --from NNNN : check only ADRs numbered NNNN or higher (to grandfather existing ADRs).
// Exit 1 when any MUST is violated. Checks that cannot run on the project's format (e.g. no index table)
// are listed as "Not checked" at the end and are never reported as violations.
//
// Section headings and the status label are English by convention (see references/adr-authoring.md, D-2);
// the body of an ADR may be in any language.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/** @typedef {"MUST" | "SHOULD"} Severity */
/** @typedef {{ rule: string, severity: Severity, file: string, line: number, message: string }} Finding */
/** @typedef {{ text: string, line: number }} Line */

const STATUSES = ["proposed", "accepted", "rejected", "deprecated", "superseded", "partially-superseded"];
const CANDIDATE_DIRS = ["docs/adr", "docs/adrs", "docs/decisions", "doc/adr", "adr", "decisions"];
const ADR_FILE_PATTERN = /^(\d{3,4})-.+\.md$/;
const INDEX_FILE_NAMES = ["README.md", "index.md"];
const LENGTH_SIGNAL_LINES = 150;
const INDEX_TITLE_MAX_CHARS = 100;

/** @type {Record<string, RegExp>} */
const SECTIONS = {
  Context: /context|background/i,
  Options: /options|alternatives/i,
  Decision: /decision/i,
  Consequences: /consequences/i,
  "Revisit conditions": /revisit/i,
};
const REFERENCES_HEADING = /references/i;

const args = process.argv.slice(2);
const fromIndex = args.indexOf("--from");
const fromNumber = fromIndex >= 0 ? Number(args[fromIndex + 1]) : 0;
const positional = args.filter((arg, i) => !arg.startsWith("--") && (fromIndex < 0 || i !== fromIndex + 1));
const adrDir = resolveAdrDir(positional[0]);

/** @type {Finding[]} */
const findings = [];
/** @type {string[]} */
const notChecked = [];
/** @type {(rule: string, severity: Severity, file: string, line: number, message: string) => void} */
const report = (rule, severity, file, line, message) => findings.push({ rule, severity, file, line, message });

const adrFiles = listAdrFiles(adrDir).filter((name) => adrNumber(name) >= fromNumber);

const indexFile = INDEX_FILE_NAMES.find((name) => existsSync(join(adrDir, name)));
const indexRows = readIndexRows();
const hasIndex = indexRows.size > 0;
if (!hasIndex) notChecked.push("no index table (`| [NNNN](./…) | title | status |`) found: E-1 (index agreement), E-3, E-5");

for (const name of adrFiles) {
  checkAdr(name, readFileSync(join(adrDir, name), "utf8").split("\n"));
}

printFindings();
process.exit(findings.some((f) => f.severity === "MUST") ? 1 : 0);

/** @param {string | undefined} given @returns {string} */
function resolveAdrDir(given) {
  if (given) {
    if (existsSync(given)) return resolve(given);
    console.error(`Directory does not exist: ${given}`);
    process.exit(2);
  }
  const found = CANDIDATE_DIRS.find((dir) => existsSync(dir) && listAdrFiles(resolve(dir)).length > 0);
  if (found) return resolve(found);
  console.error(`No ADR directory found (looked in: ${CANDIDATE_DIRS.join(", ")}). Pass it as an argument.`);
  process.exit(2);
}

/** @param {string} dir @returns {string[]} */
function listAdrFiles(dir) {
  return readdirSync(dir).filter((name) => ADR_FILE_PATTERN.test(name)).sort();
}

/** @param {string} name @returns {number} */
function adrNumber(name) {
  return Number(ADR_FILE_PATTERN.exec(name)[1]);
}

/** @returns {Map<number, { title: string, status: string, line: number }>} numbers are matched numerically, so padding does not matter */
function readIndexRows() {
  const rows = new Map();
  if (!indexFile) return rows;
  readFileSync(join(adrDir, indexFile), "utf8").split("\n").forEach((text, i) => {
    const cells = text.split("|").map((c) => c.trim());
    const id = /^\[(\d{3,4})\]/.exec(cells[1] ?? "")?.[1];
    if (id) rows.set(Number(id), { title: cells[2] ?? "", status: cells[3] ?? "", line: i + 1 });
  });
  return rows;
}

/** @param {string} name @param {string[]} lines */
function checkAdr(name, lines) {
  const id = adrNumber(name);
  const body = outsideCodeFences(lines);

  checkStatus(id, name, lines);
  checkReferences(name, body);
  checkProgressMarkers(name, body);
  checkSections(name, lines);
  checkStaleFields(name, body);
  if (lines.length > LENGTH_SIGNAL_LINES) {
    report("D-5", "SHOULD", name, 1, `${lines.length} lines (signal above ${LENGTH_SIGNAL_LINES}): has implementation detail or history leaked in?`);
  }
  if (!hasIndex) return;
  const row = indexRows.get(id);
  if (!row) report("E-3", "MUST", name, 1, `no row in the ${indexFile} index`);
  else if ([...row.title].length > INDEX_TITLE_MAX_CHARS) {
    report("E-5", "SHOULD", indexFile, row.line, `${name.slice(0, 4)}: index title is ${[...row.title].length} characters (max ${INDEX_TITLE_MAX_CHARS})`);
  }
}

/** Strip bold and code decoration. @param {string} raw */
function plainStatus(raw) {
  return raw.replace(/[*`_]/g, "").trim();
}

/**
 * Find the status in the body: a `Status: …` line, else the first line under a `## Status` heading.
 * @param {string[]} lines @returns {{ value?: string, line: number }}
 */
function findBodyStatus(lines) {
  const bodyStart = lines[0] === "---" ? lines.indexOf("---", 1) + 1 : 0;
  const findFromBody = (/** @type {RegExp} */ pattern) => lines.findIndex((l, i) => i >= bodyStart && pattern.test(l));
  const lineIndex = findFromBody(/^\s*(?:[-*]\s*)?(?:\*\*)?status(?:\*\*)?\s*:/i);
  if (lineIndex >= 0) return { value: plainStatus(lines[lineIndex].replace(/^[^:]*:\s*/, "")), line: lineIndex + 1 };
  const headingIndex = findFromBody(/^#{2,3}\s*status\s*$/i);
  if (headingIndex < 0) return { line: 1 };
  const valueIndex = lines.findIndex((l, i) => i > headingIndex && l.trim() !== "");
  return valueIndex < 0 ? { line: headingIndex + 1 } : { value: plainStatus(lines[valueIndex]), line: valueIndex + 1 };
}

/** @param {number} id @param {string} name @param {string[]} lines */
function checkStatus(id, name, lines) {
  const frontmatterRaw = /^status:\s*(.+)$/m.exec(lines.slice(0, 10).join("\n"))?.[1];
  const frontmatter = frontmatterRaw && plainStatus(frontmatterRaw).replace(/^["']|["']$/g, "");
  const body = findBodyStatus(lines);
  const official = (frontmatter ?? body.value)?.toLowerCase();
  const indexRow = indexRows.get(id);

  if (!official) {
    report("E-2", "MUST", name, 1, "no status found (no frontmatter `status:`, `Status:` line, or `## Status` section)");
    return;
  }
  if (!STATUSES.includes(official)) {
    report("E-2", "MUST", name, body.line, `status is not in the closed set (${STATUSES.join("/")}) or carries prose (one value; put notes on a separate line): ${official.slice(0, 40)}`);
  }
  if (frontmatter && body.value !== undefined && body.value.toLowerCase() !== official) {
    const sameValueWithProse = body.value.toLowerCase().startsWith(official);
    if (sameValueWithProse) report("E-2", "MUST", name, body.line, "the body status carries prose (one value; put notes on a separate line)");
    else report("E-1", "MUST", name, body.line, `body status "${body.value.slice(0, 30)}" disagrees with frontmatter "${frontmatter}"`);
  }
  if (indexRow && plainStatus(indexRow.status).toLowerCase() !== official) {
    report("E-1", "MUST", indexFile, indexRow.line, `${name.slice(0, 4)}: index says "${indexRow.status || "(empty)"}" but the ADR says "${official.slice(0, 30)}"`);
  }
}

/** @param {string} name @param {Line[]} body */
function checkReferences(name, body) {
  let inReferences = false;
  for (const { text, line } of body) {
    if (/^#{2,3}\s/.test(text)) inReferences = REFERENCES_HEADING.test(text);
    if (!inReferences && /(?<![\w-])(PR|Issue|issue)\s?#\d+|[\s(]#\d{2,5}\b|[\w-]+\/[\w-]+#\d+/.test(text)) {
      report("A-1", "MUST", name, line, "PR or issue number in the body (move it to a References section)");
    }
    if (/\bL\d{2,}\b|\bline \d+/i.test(text)) report("B-1", "MUST", name, line, "refers to a physical line number");
    for (const match of text.matchAll(/\]\((\.{1,2}\/[^)#\s]+)/g)) {
      if (!existsSync(resolve(dirname(join(adrDir, name)), match[1]))) {
        report("B-3", "MUST", name, line, `broken link: ${match[1]}`);
      }
    }
  }
}

/** @param {string} name @param {Line[]} body */
function checkProgressMarkers(name, body) {
  for (const { text, line } of body) {
    if (/^\s*[-*] \[( |x)\]/i.test(text)) report("D-1", "MUST", name, line, "checkbox (progress or task) in an ADR");
  }
}

/** @param {string} name @param {string[]} lines */
function checkSections(name, lines) {
  const headings = lines.filter((l) => /^#{2,3}\s/.test(l)).join("\n");
  for (const [label, pattern] of Object.entries(SECTIONS)) {
    if (!pattern.test(headings)) report("D-2", "MUST", name, 1, `required section missing (English heading): ${label}`);
  }
}

/** @param {string} name @param {Line[]} body */
function checkStaleFields(name, body) {
  for (const { text, line } of body) {
    if (/last updated|updated:/i.test(text)) report("F-2", "MUST", name, line, "a \"last updated\"-style field that goes stale");
  }
}

/** @param {string[]} lines @returns {Line[]} */
function outsideCodeFences(lines) {
  let inFence = false;
  const kept = [];
  lines.forEach((text, i) => {
    if (/^\s*```/.test(text)) inFence = !inFence;
    else if (!inFence) kept.push({ text, line: i + 1 });
  });
  return kept;
}

function printFindings() {
  const sorted = [...findings].sort((a, b) => a.rule.localeCompare(b.rule) || a.file.localeCompare(b.file) || a.line - b.line);
  let current = "";
  for (const f of sorted) {
    if (f.rule !== current) {
      current = f.rule;
      console.log(`\n## ${f.rule}`);
    }
    console.log(`- [${f.severity}] ${f.file}:${f.line} ${f.message}`);
  }
  const must = findings.filter((f) => f.severity === "MUST").length;
  console.log(`\nChecked ${adrFiles.length} ADRs in ${adrDir}: ${must} MUST, ${findings.length - must} SHOULD`);
  for (const note of notChecked) console.log(`Not checked: ${note}`);
}
