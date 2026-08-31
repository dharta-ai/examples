import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  ".env.example",
  "apps/web/README.md",
  "apps/api/README.md",
  "apps/mcp-server/README.md",
  "apps/mcp-server/tool-contracts.json",
  "apps/agent/README.md",
  "apps/agent/AGENTS.md",
  "apps/agent/dharta.toml",
  "apps/agent/connectors/README.md",
  "apps/agent/skills/crm-operator/SKILL.md",
  "apps/agent/artifacts/account-plan/ARTIFACT.md",
  "apps/agent/artifacts/battlecard/ARTIFACT.md",
  "apps/agent/artifacts/board-report/ARTIFACT.md",
  "packages/contracts/README.md",
  "packages/db/README.md",
  "packages/domain/README.md",
  "docs/architecture.md",
  "docs/deployment.md",
];

const failures = [];
for (const relative of required) {
  try {
    const stat = await fs.stat(path.join(root, relative));
    if (!stat.isFile()) failures.push(`${relative} is not a file`);
  } catch {
    failures.push(`${relative} is missing`);
  }
}

const agentConfig = await fs.readFile(path.join(root, "apps/agent/dharta.toml"), "utf8");
for (const fragment of [
  'name = "cinderlane-crm-agent"',
  "deploy = true",
  'type = "codex-cli"',
  'manifest = ".dharta/artifacts.json"',
  "[artifacts.kinds.account-plan]",
  "[artifacts.kinds.battlecard]",
  "[artifacts.kinds.board-report]",
]) {
  if (!agentConfig.includes(fragment)) {
    failures.push(`apps/agent/dharta.toml lacks ${JSON.stringify(fragment)}`);
  }
}

const artifactRoot = path.join(root, "apps/agent/artifacts");
for (const entry of await fs.readdir(artifactRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const recipePath = path.join(artifactRoot, entry.name, "ARTIFACT.md");
  const recipe = await fs.readFile(recipePath, "utf8");
  const frontmatter = recipe.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) {
    failures.push(`apps/agent/artifacts/${entry.name}/ARTIFACT.md lacks frontmatter`);
    continue;
  }
  const name = frontmatter[1].match(/^name:\s*(\S+)\s*$/m)?.[1];
  const description = frontmatter[1].match(/^description:\s*(.+)\s*$/m)?.[1];
  if (name !== entry.name) {
    failures.push(`Artifact Type folder ${entry.name} declares name ${JSON.stringify(name)}`);
  }
  if (!description) {
    failures.push(`Artifact Type ${entry.name} lacks a frontmatter description`);
  }
  if (!agentConfig.includes(`[artifacts.kinds.${entry.name}]`)) {
    failures.push(`Artifact Type ${entry.name} is not registered in dharta.toml`);
  }
}

async function textFiles(directory) {
  const results = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await textFiles(absolute));
    else if (/\.(?:md|json|mjs|toml|example)$/.test(entry.name)) results.push(absolute);
  }
  return results;
}

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
];
for (const file of await textFiles(root)) {
  const value = await fs.readFile(file, "utf8");
  for (const pattern of secretPatterns) {
    if (pattern.test(value)) {
      failures.push(`${path.relative(root, file)} resembles a committed credential`);
    }
  }
}

try {
  await fs.stat(path.join(root, ".env"));
  failures.push(".env must not be committed");
} catch {
  // Expected.
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Cinderlane template: ${required.length} required files and credential guards pass`);
