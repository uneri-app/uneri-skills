import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function readJsonSafe(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function listDirs(path) {
  try {
    return readdirSync(path, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
}

function findSpecFiles(cwd) {
  const files = [];
  const bRoot = join(cwd, '.kiro', 'specs');
  for (const d of listDirs(bRoot)) {
    files.push(join(bRoot, d, 'spec.json'));
  }
  const svcRoot = join(cwd, 'services');
  for (const svc of listDirs(svcRoot)) {
    const aRoot = join(svcRoot, svc, '.kiro', 'specs');
    for (const d of listDirs(aRoot)) {
      files.push(join(aRoot, d, 'spec.json'));
    }
  }
  return files;
}

function renderSpecLine(spec) {
  const a = spec.approvals ?? {};
  const yn = (x) => (x?.approved ? 'y' : 'n');
  return `- ${spec.feature_name ?? '(unknown)'} — phase:${spec.phase ?? '(unknown)'}; approved req=${yn(a.requirements)} design=${yn(a.design)} tasks=${yn(a.tasks)}; traces=${spec.traces_uc ?? '(none)'}`;
}

const WORKFLOW_MAP = `Workflow (invoke the matching /uneri-skills:* skill for the current phase):
Discovery: udd-init -> udd-add -> udd-validate (udd-arrange: order the list by the user's journey)
Spec (per UC): sdd-init -> sdd-requirements -> sdd-clarify -> sdd-design -> sdd-validate-design -> sdd-tasks -> sdd-impl -> sdd-validate-impl -> sdd-trace
Brownfield gap check: sdd-validate-gap. Steering: steering.

Approval gates: each .kiro/specs/<slug>/spec.json tracks approvals (requirements/design/tasks). /uneri-skills:sdd-impl requires ready_for_implementation: true.

Artifacts:
- .kiro/uneri/ - use cases + domain model (UC-<CTX>-NNN); load on demand.
- .kiro/specs/ - per-UC specs (requirements/design/tasks + spec.json).
- .kiro/steering/ - product/tech/structure steering (inclusion: manual; load when relevant).`;

const GUIDANCE =
  'When a task matches a phase above, invoke the corresponding /uneri-skills:* skill rather than improvising.';

export function buildContext(cwd) {
  const configPath = join(cwd, '.uneri.json');
  if (!existsSync(configPath)) return null;
  const config = readJsonSafe(configPath);
  if (!config) return null;

  const lang = config.lang ?? 'en';
  const layout = config.layout ?? 'single-context';

  const specs = findSpecFiles(cwd).map(readJsonSafe).filter(Boolean);
  const specSection =
    specs.length === 0
      ? 'Current specs:\nNo specs yet — start with /uneri-skills:udd-init, then /uneri-skills:sdd-init.'
      : `Current specs:\n${specs.map(renderSpecLine).join('\n')}`;

  return `# uneri (UDD/SDD) project

This project uses uneri for use-case-driven and spec-driven development.
Project language: ${lang} — write all generated docs and specs in this language.
Layout: ${layout}.

${WORKFLOW_MAP}

${specSection}

${GUIDANCE}`;
}

export { listDirs, readJsonSafe };
