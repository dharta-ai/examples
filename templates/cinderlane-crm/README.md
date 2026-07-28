# Cinderlane CRM

Cinderlane is a fictional CRM company used to show how an agent-first software
business can organize one repository. The repository includes the customer web
application, domain API, MCP server, Karta Agent App, and shared packages.

This is an architecture template, not a working CRM. Each service folder names
its owner, trust boundary, and production responsibilities. Replace those
README files with code in the languages your team uses.

## Repository layout

```text
cinderlane-crm/
├── apps/
│   ├── web/                 customer CRM and embedded Karta agent
│   ├── api/                 authenticated domain API
│   ├── mcp-server/          narrow agent-facing CRM tools
│   └── agent/               deployable Karta Agent App
│       ├── karta.toml
│       ├── AGENTS.md
│       ├── skills/
│       ├── connectors/
│       └── artifacts/       release-versioned Artifact Type recipes
├── packages/
│   ├── contracts/           API and event contracts
│   ├── db/                  schema, migrations, and data access
│   └── domain/              CRM rules shared by API and jobs
├── docs/
│   ├── architecture.md
│   └── deployment.md
└── scripts/
    └── check-template.mjs
```

The Agent App is one app in the company monorepo. Its Karta definition lives
inside `apps/agent`, next to the skills, connectors, and Artifact Types shipped
in the same Agent App release.

## Ownership rules

- The CRM database is the canonical record for accounts, contacts, messages,
  permissions, and audit events.
- A karta workspace holds one durable agent instance's working files. It can
  contain research, drafts, and produced Artifacts, but it does not replace the
  CRM database.
- The MCP server exposes task-sized domain operations. The agent never receives
  a database password or a raw SQL tool.
- The web and API services authenticate the end user. They pass a verified
  identity to Karta and enforce the same tenant boundary in domain calls.
- Connector credentials remain in the service that owns each integration.
  Generated Artifact files contain no access tokens.

## Request path

1. A signed-in seller opens an account in `apps/web`.
2. The page embeds the Karta widget with the seller's verified identity and
   account context.
3. Karta resumes that user's durable karta for the Cinderlane Agent App.
4. The agent calls narrow tools from `apps/mcp-server`.
5. The MCP server checks the user, tenant, requested action, and current CRM
   state through `apps/api` or shared domain code.
6. The agent writes research and drafts to its workspace. It designates useful
   outputs as Karta Artifacts.
7. The web application links the resulting Artifact back to the account.

## Start adapting the template

1. Pick the web, API, database, and job runtimes your team will operate.
2. Define tenant and user identity once in `packages/contracts`.
3. Implement read-only MCP tools before adding mutations.
4. Build the agent locally from `apps/agent`, then publish that folder as the
   Karta Agent App.
5. Deploy Karta in your cloud close to the API, MCP server, and database.
6. Add one end-to-end test that starts in the web application, crosses the
   verified identity boundary, runs an agent turn, and checks the CRM audit log.

Run `npm run check` from this directory to verify the template's required
boundaries and guard against committed credentials.
