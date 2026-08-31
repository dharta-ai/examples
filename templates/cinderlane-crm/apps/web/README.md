# Web application

The web application is the seller-facing CRM. It owns navigation, account
pages, contact views, pipeline editing, and the embedded Dharta surface.

Implement the Dharta integration with verified identity:

- obtain the user's Dharta identity assertion from `apps/api`;
- mount the widget with the stable Cinderlane Agent App reference;
- pass bounded account context, never an authorization decision;
- link Artifact IDs returned by the agent to the relevant CRM record; and
- let users reopen Artifacts without replaying the original conversation.

The browser may receive an origin-gated Dharta embed key. Keep signing secrets,
model keys, connector credentials, and database credentials on the server.
