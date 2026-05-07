# Restoring previously-deleted custom tools

The original prototype workspace shipped with these custom OpenCode tools
under `.opencode/tools/`:

- `icon-search.ts`
- `image-generator.ts`        (depended on `lib/google-vertex.ts`, used `sharp`)
- `image-modify.ts`           (depended on `lib/google-vertex.ts`, used `sharp`)
- `list-icons.ts`
- `logo-retrieval.ts`

They were deleted because keeping all 7 original custom tools caused
opencode to hang on `session.prompt status=started resolveTools` in CI —
the daemon never logged the per-tool registry events and the run timed
out. Stripping the directory cleared the hang. We now keep only the
two dev-server tools, which are sufficient to unblock CI.

When re-introducing any of the deleted tools:

1. Re-add one tool at a time, rebuilding the image and running a CI
   eval each time so the bisection point is obvious if the hang
   returns.
2. If `image-generator` / `image-modify` come back, restore
   `lib/google-vertex.ts` and the `sharp` dependency in
   `packages/agent/opencode/package.json`.
3. Match the Claude Agent SDK tool naming convention by naming files
   `mcp__<server>__<tool>.ts` (e.g. `mcp__icon__icon_search.ts`) so the
   same prompt text references one tool name across both codepaths.
   See the comment in `mcp__server__start_dev_server.ts` for the
   rationale.
