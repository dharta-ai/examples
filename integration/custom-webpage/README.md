# Custom webpage (bring-your-own-DOM)

The advanced integration: keep **your page's own textbox and content area**, and
let a Dharta-hosted agent stream its replies into the elements you already have.
No floating widget, no iframe. This is the same pattern that powers the live chat
on the [dharta.sh](https://dharta.sh) home page.

Use this when the widget's prebuilt UI isn't enough — you want the agent to live
*inside* your page's design, driven by your own input box.

| | |
| --- | --- |
| **Identity** | anonymous |
| **Backend** | none (a publishable embed key authenticates the browser) |
| **You provide** | a text input + a content area in your own markup |
| **Dharta provides** | the streamed agent turns |

## How it works

A small framework-agnostic ES module, [`src/mount-inline-agent.js`](src/mount-inline-agent.js),
wraps the published headless client (`DhartaAgentClient`) and binds it to your DOM:

```js
import { mountInlineAgent } from "./src/mount-inline-agent.js";

const agent = mountInlineAgent({
  input: "#input",            // your textbox (element or selector)
  output: "#transcript",      // your content area
  submit: "#send",            // optional; Enter and form-submit also send
  agentRef: "org-8z06atvr/dharta",
  baseUrl: "https://agent.dharta.sh",
  embedKey: "pk_live_…",      // publishable, origin-gated — safe in page source
  escalateHref: "mailto:support@dharta.sh",
});

// Optional: make suggestion chips send real turns.
agent.send("How do I deploy an agent?");

// Optional: the underlying client is exposed so the page can drive session
// continuity itself — e.g. list the visitor's past conversations and replay
// the newest one on load.
// agent.client.listSessions() / agent.client.openSession(id)
```

It renders **text only** (a front-door chat shows words, not tool calls) and
accumulates streamed text **per `partId`**: a `message` flagged `delta` is an
incremental chunk to **append** (the OpenAI-compatible streaming contract, e.g.
the goose harness), while an unflagged `message` is the full text-so-far and
**replaces** its part. It renders agent text through the widget's escape-first
`renderMarkdown` (HTML-escaped first, then only a safe tag whitelist; links are
scheme-allowlisted) - so doc links render clickable without a reply being able to
inject markup into your page.

## Run the demo

The page is static, but it must be served over `http://localhost` (not opened as a
`file://`): ES modules don't load over `file://`, and the embed key's origin
allowlist needs a real origin.

```bash
cd integration/custom-webpage
npx serve .         # or: python3 -m http.server 8080
# open the printed http://localhost:… URL
```

Out of the box it points at Dharta's own support agent (the live
`org-8z06atvr/dharta` project). To make live replies work you need an origin-gated
`pk_live_` key that allowlists your local origin:

```bash
cp config.example.js config.js   # config.js is gitignored
# paste your key into config.js
```

Without a real key the page still loads and is fully interactive — sending just
shows a graceful error and the "Talk to a human" link.

## Run the tests

```bash
npm install
npm test
```

The tests inject a fake client and assert the DOM behavior (REPLACE streaming,
text-only rendering, busy gating, error + escalation, render-hook overrides).
They don't hit the network — the client itself is tested in `@dharta/widget`.

## Wiring it into your own app (e.g. Rails)

There's no build step and no React. Copy two files into your codebase and load
them as modules:

- `src/dharta-agent-client.js` — the vendored headless client (see *Updating the
  vendored client* below)
- `src/mount-inline-agent.js` — the binding module

Then, in any server-rendered page that has a textbox and a content area, add a
module script. This is exactly how dharta.sh does it (a Rails app, importmap-free):

```erb
<%# only emit when the project + key are configured, e.g. from ENV %>
<script type="module" nonce="<%= content_security_policy_nonce %>">
  import { mountInlineAgent } from "/dharta/mount-inline-agent.js";
  mountInlineAgent({
    input: "#input",
    output: "#thread",
    agentRef: "<%= @agent[:agent_ref] %>",
    baseUrl: "<%= @agent[:base_url] %>",
    embedKey: "<%= @agent[:embed_key] %>",
    // Match your page's markup so live replies look native:
    renderUser(text, out) { /* append your user-bubble element */ },
    createReply(out) { /* return { element, setText, setError } */ },
  });
</script>
```

Serve the two `.js` files as same-origin static assets (e.g. from `public/`) so
your Content-Security-Policy `script-src 'self'` covers them, and make sure
`connect-src` includes your `baseUrl` so the browser can reach the agent.

### Prefer not to expose a key? Mint a token server-side

The embed key is publishable and safe, but if you'd rather not ship one, mint a
short-lived session token on your backend and pass a `tokenFn` instead of
`embedKey` when you construct the client. See `DhartaAgentClient`'s `tokenFn` /
`tokenEndpoint` options in `@dharta/widget`.

## Updating the vendored client

`src/dharta-agent-client.js` is a generated bundle of `DhartaAgentClient` from
`@dharta/widget` (the banner at the top records the source commit). It's vendored
rather than installed from npm. To refresh it from the SDK source:

```bash
esbuild sdks/widget/src/client.ts --bundle --format=esm --target=es2020 \
  --outfile=integration/custom-webpage/src/dharta-agent-client.js
```

(then re-add the provenance banner). Because this example *is* the dharta.sh home
page integration, drift from the live endpoint shows up immediately on
dharta.sh — the dogfood is the freshness check.
