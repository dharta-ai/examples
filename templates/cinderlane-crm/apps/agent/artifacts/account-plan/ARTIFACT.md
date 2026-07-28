---
name: account-plan
description: A versioned plan for one customer account, grounded in current CRM evidence.
---

# Account plan

Create an account plan when a seller needs a durable strategy for one account.

Write the instance under `outputs/account-plans/<account-id>/`. Keep the plan
and any output-owned diagrams in that folder. Bind shared research data as
named read-only inputs when it belongs elsewhere in the workspace.

The plan must identify the account, evidence timestamp, goals, stakeholders,
open opportunities, risks, next actions, owners, and unresolved questions.
Mark inferences. Do not copy access tokens, private connector payloads, or the
full CRM record into the Artifact.

Use a passive Markdown entry unless the plan needs custom executable behavior.
Validate links and headings before designation. Use `type_id` `account-plan`.
