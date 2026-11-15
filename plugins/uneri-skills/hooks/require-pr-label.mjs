import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// PreToolUse(Bash) hook: stop a `gh pr create` that carries no label that says what the PR is for.
// A PR is told apart by its labels only, so every PR carries one of:
//   - UC-<CTX>-NNN          a UC's PR
//   - bug / enabler / chore a PR no UC owns (kind)
// An unlabeled PR cannot be told apart from any other, so a person has to sort it by hand.
// `/uneri-skills:pr-upsert` already passes the label; this is the safety net for a PR opened without the skill.
// Only the command string is inspected, and only in a project that uses uneri (`.uneri.json`);
// anywhere else it is a silent no-op.

const KIND_LABELS = new Set(['bug', 'enabler', 'chore']);
const UC_LABEL = /^UC-[A-Z][A-Z0-9_]*-\d+$/i;

export const MESSAGE = `\`gh pr create\` has no label that says what the PR is for. Add one with \`--label\`:
  - a UC's PR              : --label UC-<CTX>-NNN (the spec's traces_uc; every UC if there are several)
  - a PR no UC owns        : --label bug | enabler | chore
Or open the PR through /uneri-skills:pr-upsert, which attaches the label for you.
Why: a PR is told apart by its labels only; an unlabeled PR is one a person has to sort by hand.`;

/**
 * Drop each heredoc's body and its `<<EOF` opener, keeping the rest of the opener line (`cat <<EOF && gh pr
 * create …` still has a command on it). `<<<` is a here-string, not a heredoc; `<<-` allows an indented
 * terminator, plain `<<` does not; `<<\EOF` and quoted delimiters are accepted; an unterminated one is left alone.
 */
export function stripHeredocs(cmd) {
  const opener = /(?<!<)<<(?!<)(-?)\s*\\?(['"]?)(\w+)\2([^\n]*)\n/g;
  let out = '';
  let last = 0;
  for (let m = opener.exec(cmd); m !== null; m = opener.exec(cmd)) {
    const [whole, dash, , word, rest] = m;
    let pos = m.index + whole.length;
    let end = -1;
    while (pos <= cmd.length) {
      const eol = cmd.indexOf('\n', pos);
      const line = cmd.slice(pos, eol === -1 ? cmd.length : eol);
      if ((dash ? line.trimStart() : line).replace(/[ \t]+$/, '') === word || line.startsWith(`${word})`)) {
        end = pos + (dash ? line.length - line.trimStart().length : 0) + word.length;
        break;
      }
      if (eol === -1) break;
      pos = eol + 1;
    }
    if (end === -1) continue;
    out += cmd.slice(last, m.index) + rest;
    last = end;
    opener.lastIndex = end;
  }
  return out + cmd.slice(last);
}

const OPERATORS = new Set([';', '&', '|', '(', ')', '\n']);

/** Index just after the `)` closing the `$(` whose `(` is at `open`; the input length when it never closes. */
function substitutionEnd(input, open) {
  let depth = 0;
  let quote = '';
  for (let i = open; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = '';
      else if (ch === '\\' && quote === '"') i += 1;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
    } else if (ch === '(') {
      depth += 1;
    } else if (ch === ')') {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return input.length;
}

/**
 * POSIX-like word splitting into one entry per simple command: `{ tokens, depth }`, where an unquoted `;` `&`
 * `|` `(` `)` or newline ends the command and `depth` is the subshell nesting. `$(…)` stays inside its word
 * (so `--title $(git log -1) --label bug` keeps its label) and its body is collected in `nested` to be scanned
 * on its own — also inside double quotes. A `#` starts a comment; `\<newline>` is removed. Null when a quote is
 * left open.
 */
export function splitCommands(input) {
  const commands = [];
  const nested = [];
  let tokens = [];
  let depth = 0;
  let current = '';
  let inToken = false;
  const endToken = () => {
    if (inToken) tokens.push(current);
    current = '';
    inToken = false;
  };
  const endCommand = () => {
    endToken();
    if (tokens.length > 0) commands.push({ tokens, depth });
    tokens = [];
  };
  const substitution = (i) => {
    const end = substitutionEnd(input, i + 1);
    nested.push(input.slice(i + 2, end - 1));
    current += input.slice(i, end);
    inToken = true;
    return end;
  };
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "'") {
      const end = input.indexOf("'", i + 1);
      if (end === -1) return null;
      current += input.slice(i + 1, end);
      inToken = true;
      i = end + 1;
    } else if (ch === '"') {
      i += 1;
      let closed = false;
      while (i < input.length) {
        if (input[i] === '\\' && i + 1 < input.length && '"\\'.includes(input[i + 1])) {
          current += input[i + 1];
          i += 2;
        } else if (input[i] === '"') {
          closed = true;
          i += 1;
          break;
        } else if (input[i] === '$' && input[i + 1] === '(') {
          i = substitution(i);
        } else {
          current += input[i];
          i += 1;
        }
      }
      if (!closed) return null;
      inToken = true;
    } else if (ch === '$' && input[i + 1] === '(') {
      i = substitution(i);
    } else if (ch === '\\') {
      if (i + 1 >= input.length) return null;
      if (input[i + 1] === '\n') {
        i += 2; // line continuation: `\<newline>` is removed, not a word
      } else {
        current += input[i + 1];
        inToken = true;
        i += 2;
      }
    } else if (ch === '#' && !inToken) {
      while (i < input.length && input[i] !== '\n') i += 1; // a comment runs to the end of the line
    } else if (ch === '&' && (input[i - 1] === '>' || input[i - 1] === '<' || input[i + 1] === '>')) {
      current += ch; // a redirection (`2>&1`, `>&2`, `&>`), not a command separator
      inToken = true;
      i += 1;
    } else if (OPERATORS.has(ch)) {
      endCommand();
      if (ch === '(') depth += 1;
      if (ch === ')') depth = Math.max(0, depth - 1);
      i += 1;
    } else if (/\s/.test(ch)) {
      endToken();
      i += 1;
    } else {
      current += ch;
      inToken = true;
      i += 1;
    }
  }
  endCommand();
  commands.nested = nested;
  return commands;
}

// Words that may precede the command itself: wrappers, and shell keywords / grouping (`then gh …`, `{ gh …`).
const WRAPPERS = new Set([
  'env',
  'command',
  'exec',
  'sudo',
  'time',
  'nohup',
  'nice',
  'xargs',
  'ionice',
  'setsid',
  'stdbuf',
  'timeout',
]);
const KEYWORDS = new Set(['if', 'then', 'else', 'elif', 'do', 'while', 'until', '!', '{']);
// Wrapper options that take a value: `sudo -u x gh …`, `timeout -s KILL 5 gh …`.
const OPTION_WITH_VALUE = new Set(['-u', '-g', '-C', '-h', '-p', '-U', '-n', '-s', '-k']);

/** Index of the command word itself, after wrappers (and their options), shell keywords and `VAR=x`. */
function commandStart(tokens) {
  let i = 0;
  for (;;) {
    const token = tokens[i] ?? '';
    if (KEYWORDS.has(token) || /^\w+=/.test(token)) {
      i += 1;
    } else if (WRAPPERS.has(token.replace(/^.*\//, ''))) {
      i += 1;
      while (i < tokens.length && tokens[i].startsWith('-')) i += OPTION_WITH_VALUE.has(tokens[i]) ? 2 : 1;
      if (token.endsWith('timeout') && /^\d/.test(tokens[i] ?? '')) i += 1; // `timeout 60 gh …`
    } else {
      return i;
    }
  }
}

/** The command string of `bash -c '…'` / `sh -c` / `eval …`, so a `gh pr create` inside it is seen too; else null. */
export function nestedCommand(tokens) {
  const start = commandStart(tokens);
  const name = (tokens[start] ?? '').replace(/^.*\//, '');
  if (name === 'eval') return tokens.slice(start + 1).join(' ');
  if (!['bash', 'sh', 'zsh', 'dash', 'ksh'].includes(name)) return null;
  const c = tokens.findIndex((token, i) => i > start && /^-\w*c\w*$/.test(token));
  return c === -1 ? null : (tokens[c + 1] ?? null);
}

/** The words after `gh pr create` when this command is one (wrappers, `VAR=x`, and `gh -R repo` global flags allowed), else null. */
export function prCreateArgs(tokens) {
  let i = commandStart(tokens);
  if (!/(^|\/)gh$/.test(tokens[i] ?? '')) return null;
  i += 1;
  while (i < tokens.length && tokens[i].startsWith('-')) {
    i += tokens[i] === '-R' || tokens[i] === '--repo' ? 2 : 1;
  }
  return tokens[i] === 'pr' && tokens[i + 1] === 'create' ? tokens.slice(i + 2) : null;
}

/**
 * Every `gh pr create` in the command — its arguments and the directory it runs in (following plain `cd <dir>`
 * steps, restored when a subshell ends) — including those inside `$(…)`, `bash -c` and `eval`.
 * Null when the command cannot be parsed (a quote left open).
 */
export function prCreates(cmd, cwd = process.cwd()) {
  const commands = splitCommands(stripHeredocs(cmd));
  if (commands === null) return null;
  const found = [];
  const saved = [];
  let dir = cwd;
  let depth = 0;
  for (const { tokens, depth: at } of commands) {
    while (depth < at) {
      saved.push(dir); // entering a subshell: a `cd` inside it must not outlive it
      depth += 1;
    }
    while (depth > at) {
      dir = saved.pop() ?? dir;
      depth -= 1;
    }
    const start = commandStart(tokens);
    if (tokens[start] === 'cd') {
      const raw = tokens[start + 1] ?? '';
      // Follow only a plain `cd <dir>`; `cd -P x`, `cd -`, `cd $VAR` are not resolvable here (keep the directory).
      if (tokens.length === start + 2 && raw !== '' && !raw.startsWith('-') && !/[$`]/.test(raw)) {
        const path = raw === '~' || raw.startsWith('~/') ? join(homedir(), raw.slice(1)) : raw;
        dir = isAbsolute(path) ? path : join(dir, path);
      }
      continue;
    }
    const inner = nestedCommand(tokens);
    if (inner !== null) found.push(...(prCreates(inner, dir) ?? []));
    const args = prCreateArgs(tokens);
    if (args !== null) found.push({ args, dir });
  }
  for (const body of commands.nested) found.push(...(prCreates(body, dir) ?? []));
  return found;
}

// Flags of `gh pr create` that take a value: that value is not a flag, whatever it looks like.
const VALUE_FLAGS = new Set([
  '--title',
  '-t',
  '--body',
  '-b',
  '--body-file',
  '-F',
  '--base',
  '-B',
  '--head',
  '-H',
  '--assignee',
  '-a',
  '--milestone',
  '-m',
  '--project',
  '-p',
  '--reviewer',
  '-r',
  '--template',
  '-T',
  '--repo',
  '-R',
  '--recover',
]);

/** The labels and whether help was asked for, reading only real flags (never a flag's value). */
function parseArgs(args) {
  const labels = [];
  let help = false;
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (VALUE_FLAGS.has(token)) {
      i += 1;
    } else if (token === '--help' || token === '-h') {
      help = true;
    } else if ((token === '--label' || token === '-l') && i + 1 < args.length) {
      labels.push(...args[i + 1].split(','));
      i += 1;
    } else if (token.startsWith('--label=')) {
      labels.push(...token.slice('--label='.length).split(','));
    } else if (/^-[dfwe]+l$/.test(token) && i + 1 < args.length) {
      labels.push(...args[i + 1].split(',')); // clustered short flags: -fl bug
      i += 1;
    } else if (/^-l.+/.test(token) && !token.startsWith('--')) {
      labels.push(...token.slice(2).split(',')); // glued short form: -lbug
    }
  }
  return { labels: labels.map((label) => label.trim()).filter((label) => label !== ''), help };
}

/** The labels of the `gh pr create` commands in the command (none when there is none, or it cannot be parsed). */
export function labelsOf(cmd) {
  return (prCreates(cmd) ?? []).flatMap(({ args }) => parseArgs(args).labels);
}

/** Whether the directory is inside a project that uses uneri: a `.uneri.json` here or in any parent. */
export function usesUneri(dir) {
  let current = dir;
  for (;;) {
    if (existsSync(join(current, '.uneri.json'))) return true;
    const parent = dirname(current);
    if (parent === current) return false;
    current = parent;
  }
}

/** The reason to stop (returned to Claude), or null to let the call through. */
export function decide(payload, hasUneri = usesUneri) {
  if (payload?.tool_name !== 'Bash') return null;
  const cmd = payload.tool_input?.command ?? '';
  const cwd = payload.cwd || process.cwd();
  const found = prCreates(cmd, cwd);
  if (found === null) {
    // Unparseable (a quote left open): fall back to a plain text check rather than letting it through.
    const looksLikePr = /\bgh\s+pr\s+create\b/.test(cmd);
    const hasLabelFlag = /(--label|(^|\s)-l)\S*[\s=]*(UC-|bug|enabler|chore|[$`])/i.test(cmd);
    return looksLikePr && hasUneri(cwd) && !hasLabelFlag ? MESSAGE : null;
  }
  for (const { args, dir } of found) {
    if (!hasUneri(dir)) continue;
    const { labels, help } = parseArgs(args);
    if (help) continue; // prints help, creates nothing
    // A label left as `$VAR` / `$(…)` is not known until the shell expands it: do not block on a guess.
    if (labels.some((label) => /[$`]/.test(label))) continue;
    if (!labels.some((label) => KIND_LABELS.has(label.toLowerCase()) || UC_LABEL.test(label))) return MESSAGE;
  }
  return null;
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return 0;
  }
  let reason = null;
  try {
    reason = decide(payload);
  } catch {
    return 0; // never break the session
  }
  if (reason === null) return 0;
  console.error(reason);
  return 2; // PreToolUse exit 2: block the call and return stderr to Claude
}

// Run only when executed directly, not when imported by the tests.
// Compare real paths: a symlinked plugin directory makes the two URLs differ otherwise.
function isDirectRun() {
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1] ?? '')).href;
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  process.exit(main());
}
