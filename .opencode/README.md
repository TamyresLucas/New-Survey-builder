# opencode runtime workspace

Source for the OpenCode workspace that ships inside the prototype-session container. At image build time `prototype-session/Dockerfile` copies this directory in twice — once to `/template/.opencode` and once to `/workspace/.opencode` — where the `opencode serve` daemon picks it up as a normal hidden config dir.

It's named `opencode` (no leading dot) in source so it isn't a hidden directory in the repo and so editor/tooling globs don't skip it. The dot only appears at runtime.

## Contents

- `opencode.json` — provider, model, and MCP server configuration loaded by the daemon on startup
- `tools/` — custom OpenCode tools (`@opencode-ai/plugin`) for icon search, image generation/modification, logo retrieval, and starting/restarting the workspace dev server
- `lib/` — helpers shared by the tools (dev server lifecycle, Google Vertex client construction)
- `package.json` — runtime dependencies the daemon installs when it loads the tools

## Editing

Anything checked in here ends up at `/workspace/.opencode/` and `/template/.opencode/` in the container. Changes only take effect after a new prototype-session image is built — there is no live reload.
