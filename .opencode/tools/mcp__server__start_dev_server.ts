// Despite the `mcp__server__` filename prefix, this is a local OpenCode
// custom tool, NOT an MCP-served tool. The filename is chosen so the
// resulting tool ID matches what the same tool would be called when
// served via Claude Agent SDK (`mcp__server__start_dev_server`), letting
// a single shared prompt reference one tool name across both codepaths.
import { tool } from '@opencode-ai/plugin'
import { startDevServer } from '../lib/dev-server.ts'

export default tool({
  description:
    'Start the development server for this prototype and return the DEV_SERVER_PORT to use for browser validation.',
  args: {
    reasoning: tool.schema.string().describe('Explain why the dev server needs to be started'),
  },
  async execute(_args, context) {
    const port = process.env.DEV_SERVER_PORT || '8080'
    const result = await startDevServer(context.directory, port, console)
    if (!result.success) throw new Error(result.message)
    return result.message
  },
})
