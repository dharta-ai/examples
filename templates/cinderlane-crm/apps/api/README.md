# Domain API

The API is the authority for Cinderlane users, tenants, CRM records, and audit
events. It serves the web application and the MCP server through separate
authentication policies.

Required endpoints usually include:

- browser sessions and verified Karta identity assertions;
- account, contact, activity, task, and opportunity APIs;
- idempotent mutation endpoints used by MCP tools;
- Artifact link registration and removal; and
- connector authorization and revocation callbacks.

Do not trust account IDs, tenant IDs, or user IDs supplied as conversational
context. Resolve the caller's current access on every request.
