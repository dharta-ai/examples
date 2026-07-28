# Deployment

## Hosted product shape

Deploy the web application at the product domain. Run the API, MCP server,
database, connector workers, and a Karta BYOC data plane in the same cloud
region. Private routing between Karta and the MCP server keeps CRM tool traffic
off the public internet.

The web application embeds the Karta widget using an origin-gated publishable
key. The API mints verified user identity assertions after Cinderlane login.
Browser code never receives the identity-signing secret, model provider keys,
connector tokens, or database credentials.

## Release units

- Deploy `apps/web`, `apps/api`, and `apps/mcp-server` through the company's
  normal service pipeline.
- Publish `apps/agent` as a Karta Agent App release.
- Apply database migrations before code that depends on them.
- Version tool contracts so an old in-flight Agent App release can finish
  safely while a new release rolls out.

An Agent App release changes agent behavior. Existing kartas retain their
durable workspaces. Activation should move new sessions to the new release
without rewriting old workspace state.

## Production checks

Before activation, prove:

1. verified user identity reaches both Karta and the CRM authorization layer;
2. cross-tenant account IDs fail at the MCP boundary;
3. tool retries do not duplicate CRM writes;
4. revoked connector access stops new downstream calls;
5. an agent turn produces an Artifact that the same user can reopen;
6. logs contain IDs and outcomes but no prompts, tokens, or customer payloads;
7. the Agent App release can roll back without a database rollback.
