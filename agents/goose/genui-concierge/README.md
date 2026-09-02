# Concierge (generative UI, Goose)

A concierge agent that answers with **interactive UI**, not just text. It renders
the built-in forms and cards, plus two components this example ships itself:

| Component | Tier | What it is |
| --- | --- | --- |
| `pentagraph` | 2 | A five-axis radar chart drawn by builder JavaScript in a Web Worker. No DOM and no network: the worker returns a serialized element tree and Dharta materializes it against an allowlist. |
| `canvasBars` | 3 | A `<canvas>` bar chart in a sandboxed iframe. Imperative main-thread drawing is what Tier 3 exists for. |

Both are clickable, and a click arrives at the agent as its next turn.

## Layout

```
genui-concierge/
  dharta.toml               [genui] registration and [genui.build] source
  AGENTS.md
  .goose/dharta.jsonc       harness config
  genui/components/
    pentagraph/
      component.json        tier, props schema, events
      worker.js             the Tier-2 worker source
    canvasBars/
      component.json        tier, props schema, events
      index.html            the Tier-3 iframe fragment
```

Dharta injects the `dharta-generative-ui` skill itself, so this folder ships no
copy of it. `AGENTS.md` covers only what the skill cannot know: when this
agent should emit a surface, and what its own two components do.

## Build the bundle, then deploy

`dharta.toml` declares `bundle = "genui/bundle.json"`, and that file is generated
rather than hand-written. Build it before your first deploy, and again after any
change under `genui/components/`:

```sh
dharta genui build     # writes genui/bundle.json, records bundle_sha256
dharta genui check     # verifies the file, its digest, and its contents
dharta deploy
```

Commit both the bundle and the digest. A release is accepted only when the
bundle's bytes hash to the recorded `bundle_sha256`, and `dharta deploy` refuses
before it uploads anything if they disagree.

## Try it

Deploy, open the agent, and ask for something with structure in it:

- "Sign me up" - a form.
- "How is my account doing this quarter?" - a `pentagraph`.
- "Show me my spend by month" - a `canvasBars` chart.
- "What are your hours?" - prose, because a sentence is the right answer.

Then click a vertex or a bar. The agent receives the click as its next turn and
answers about that point.
