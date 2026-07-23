#!/usr/bin/env bun
/**
 * Delete stale Neon `preview/*` branches to free Vercel integration slots.
 *
 * Required env:
 *   NEON_API_KEY      - Neon personal/organization API key
 *   NEON_PROJECT_ID   - Neon project id linked to Vercel
 *
 * Optional env:
 *   KEEP_BRANCH       - preview branch name to keep (e.g. preview/cursor/admin-hardening-8d97)
 *   DRY_RUN=1         - list only, do not delete
 */

const apiKey = process.env.NEON_API_KEY;
const projectId = process.env.NEON_PROJECT_ID;
const keepBranch = process.env.KEEP_BRANCH?.trim();
const dryRun = process.env.DRY_RUN === '1';

if (!apiKey || !projectId) {
  console.error(
    '[neon-prune] Missing NEON_API_KEY or NEON_PROJECT_ID — skipping prune.',
  );
  process.exit(0);
}

const base = `https://console.neon.tech/api/v2/projects/${projectId}`;

async function neon(path, init = {}) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(
      `Neon ${init.method ?? 'GET'} ${path} failed (${res.status}): ${typeof data === 'string' ? data : JSON.stringify(data)}`,
    );
  }
  return data;
}

const list = await neon('/branches');
const branches = list.branches ?? [];

const previewBranches = branches.filter((b) => {
  const name = b.name ?? '';
  return name.startsWith('preview/');
});

console.log(
  `[neon-prune] Found ${previewBranches.length} preview branch(es) in ${projectId}`,
);

let deleted = 0;
for (const branch of previewBranches) {
  const name = branch.name;
  if (keepBranch && name === keepBranch) {
    console.log(`[neon-prune] keep ${name}`);
    continue;
  }
  if (branch.default || branch.primary) {
    console.log(`[neon-prune] skip primary/default ${name}`);
    continue;
  }

  if (dryRun) {
    console.log(`[neon-prune] would delete ${name} (${branch.id})`);
    continue;
  }

  console.log(`[neon-prune] deleting ${name} (${branch.id})`);
  await neon(`/branches/${branch.id}`, { method: 'DELETE' });
  deleted += 1;
}

console.log(`[neon-prune] done (deleted=${deleted}, dryRun=${dryRun})`);
