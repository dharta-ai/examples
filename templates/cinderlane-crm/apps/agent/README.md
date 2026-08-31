# Cinderlane Agent App

This folder is the Dharta deployment unit. Run Dharta development and publish
commands from here, not from the monorepo root.

It contains:

- `dharta.toml`, the Agent App manifest;
- `AGENTS.md`, the Codex harness instructions;
- `skills/`, reusable CRM knowledge and process;
- `connectors/`, declarations and setup notes for external services; and
- `artifacts/`, release-versioned recipes for the outputs this Agent App
  produces often.

Produced Artifact instances belong in the dharta workspace, outside the
release-owned `artifacts/` recipes. The agent designates them in
`.dharta/artifacts.json` after writing the output.
