# Cinderlane Agent App

This folder is the Karta deployment unit. Run Karta development and publish
commands from here, not from the monorepo root.

It contains:

- `karta.toml`, the Agent App manifest;
- `AGENTS.md`, the Codex harness instructions;
- `skills/`, reusable CRM knowledge and process;
- `connectors/`, declarations and setup notes for external services; and
- `artifacts/`, release-versioned recipes for the outputs this Agent App
  produces often.

Produced Artifact instances belong in the karta workspace, outside the
release-owned `artifacts/` recipes. The agent designates them in
`.karta/artifacts.json` after writing the output.
