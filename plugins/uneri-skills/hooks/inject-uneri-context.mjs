import { buildContext } from './build-context.mjs';

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  let cwd = process.cwd();
  try {
    const raw = await readStdin();
    if (raw.trim()) {
      const input = JSON.parse(raw);
      if (input && typeof input.cwd === 'string') cwd = input.cwd;
    }
  } catch {
    // ignore stdin problems; fall back to process.cwd()
  }

  try {
    const ctx = buildContext(cwd);
    if (ctx) {
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: 'SessionStart',
            additionalContext: ctx,
          },
        }),
      );
    }
  } catch {
    // never break the session
  }
}

main().catch(() => {});
