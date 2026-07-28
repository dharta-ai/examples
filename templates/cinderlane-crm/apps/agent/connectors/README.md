# Connectors

Connector declarations belong with the Agent App because they describe what
the agent can ask to use. Credential storage and OAuth callbacks belong in the
service that owns each integration.

A production Cinderlane release may declare:

- Gmail and Calendar for messages and meetings;
- Slack for account-room context; and
- Zoom for transcript metadata.

Each connector needs named read and write scopes, an end-user or organization
ownership rule, revocation handling, and audit coverage. The agent receives
bounded tools or API capabilities, never OAuth refresh tokens.
