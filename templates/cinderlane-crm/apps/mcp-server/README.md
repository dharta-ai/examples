# MCP server

The MCP server gives the Cinderlane Agent App a small CRM tool surface. It is a
domain adapter, not a SQL proxy.

The initial tool set in `tool-contracts.json` separates reads from mutations.
Read tools return bounded account facts. Mutation tools accept an idempotency
key and produce a domain audit event through `apps/api`.

For every call:

1. authenticate the Dharta agent or service identity;
2. bind the call to one Cinderlane tenant;
3. recheck the end user's current access when the action is user-bound;
4. validate arguments against the published tool contract;
5. call the domain API or shared domain package; and
6. record the tool name, target ID, outcome, and approval reference without
   copying prompts or access tokens.

The MCP server may call ordinary APIs. Produced Artifacts do not call MCP tools;
only the agent does.
