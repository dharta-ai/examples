# Architecture

## Product boundary

Cinderlane sells a CRM application whose agent can read account context,
perform bounded actions, and leave durable work behind. Karta runs the Agent
App. Cinderlane owns the CRM interface, domain services, database, integrations,
and product billing.

Karta does not become the CRM system of record. The Cinderlane API does not
become an agent harness. The MCP server is the typed bridge between them.

## Components

`apps/web` renders the CRM and embeds the Karta agent. It requests a short-lived
Karta identity assertion from the API after the normal Cinderlane login.

`apps/api` owns tenant membership, authorization, domain writes, identity
assertions, audit records, and links between CRM records and Karta Artifacts.

`apps/mcp-server` turns CRM operations into narrow agent tools. Each call
receives an agent identity, an end-user identity when the action is user-bound,
and a tenant scope. The server checks all three before calling domain code.

`apps/agent` is the deployable Agent App. Karta combines its harness,
instructions, skills, tools, and Artifact Types into immutable releases. Each
karta is a durable instance with a persistent workspace.

`packages/db` owns migrations and transaction boundaries. Neither the browser
nor the Agent App imports it.

## Data placement

| Data | Owner | Reason |
| --- | --- | --- |
| Accounts, contacts, activities | CRM database | Shared transactional state |
| OAuth refresh tokens | Connector service secret store | Revocation and rotation |
| Agent drafts and research | Karta workspace | Durable per-instance working state |
| Produced reports and plans | Karta Artifact versions | User-visible work product |
| Artifact links on accounts | CRM database | Product navigation and retention |
| Tool and mutation audit | CRM audit log plus Karta telemetry | Cross-boundary accountability |

## Authorization

Read tools require an authenticated agent, tenant scope, and the requesting
user's current CRM access. Write tools also require an explicit action purpose,
idempotency key, and domain authorization at execution time.

The Agent App receives no database credential. The MCP server receives no Karta
deployment credential. A shared Artifact receives neither. Each component gets
only the credential needed for its own boundary.

Start with read tools. Add mutations one operation at a time, with an approval
policy and audit event for each one.
