// NOTE: This file intentionally duplicates dev-server logic that lives elsewhere
// in the agent codebase. It must remain self-contained — only `node:` builtins —
// because the entire `packages/agent/opencode/` directory is copied verbatim into
// the runtime workspace as `.opencode/` (see prototype-session/Dockerfile), where
// opencode discovers the sibling `tools/mcp__server__*.ts` files as custom tools.
// Those tool files import from this module via a relative path, so this module
// has to load standalone in the workspace's node environment without the rest of
// the agent package available.
import { exec } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

type Logger = {
  log?: (message: string) => void
  warn?: (message: string) => void
  error?: (message: string) => void
}

export type DevServerStartResult = {
  success: boolean
  actualPort: string
  pid: string
  message: string
  logFile: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const readIfExists = async (file: string) => {
  try {
    return await readFile(file, 'utf-8')
  } catch {
    return ''
  }
}

export const killDevServerForWorkDir = async (workDir: string, logger: Logger) => {
  const pidFile = path.join(workDir, '.dev-server.pid')
  const pid = (await readIfExists(pidFile)).trim()

  if (pid && /^\d+$/.test(pid)) {
    logger.log?.(`[dev-server] Found existing dev server with PID ${pid}, killing process group...`)
    const { stdout } = await execAsync(
      [
        `if ps -p ${pid} > /dev/null 2>&1; then`,
        `kill -- -${pid} 2>/dev/null || kill -9 -- -${pid} 2>/dev/null || true`,
        `echo "Killed process group ${pid}"`,
        'else',
        `echo "Process ${pid} already exited"`,
        'fi',
      ].join('\n'),
      { cwd: workDir, shell: '/bin/bash' },
    )
    if (stdout.trim()) logger.log?.(`[dev-server] ${stdout.trim()}`)
  }

  if (existsSync(pidFile)) {
    await unlink(pidFile).catch(() => undefined)
  }
}

const waitForVite = async (workDir: string, requestedPort: string, logFile: string) => {
  const started = Date.now()
  while (Date.now() - started < 10_000) {
    const log = await readIfExists(logFile)
    const portMatch = log.match(/Local:\s+http:\/\/localhost:(\d+)/i)
    if (portMatch?.[1]) return portMatch[1]

    if (log.includes('EADDRINUSE') || log.includes('address already in use')) {
      throw new Error(`Port ${requestedPort} is already in use. Check dev-server.log for details.`)
    }

    await sleep(500)
  }

  const diagnostic = (await readIfExists(path.join(workDir, 'dev-server.log'))).slice(-500)
  throw new Error(
    `Dev server did not become ready within 10 seconds. Check ${logFile} for details.${
      diagnostic ? `\n\nLast 500 chars of log:\n${diagnostic}` : ''
    }`,
  )
}

export const startDevServer = async (
  workDir: string,
  requestedPort: string,
  logger: Logger = {},
): Promise<DevServerStartResult> => {
  const logFile = path.join(workDir, 'dev-server.log')
  const pidFile = path.join(workDir, '.dev-server.pid')

  await mkdir(workDir, { recursive: true })
  await killDevServerForWorkDir(workDir, logger)

  try {
    const { stdout } = await execAsync(
      `setsid npm run dev -- --port ${requestedPort} > "${logFile}" 2>&1 & echo $!`,
      { cwd: workDir, shell: '/bin/bash' },
    )
    const pid = stdout.trim()
    await writeFile(pidFile, pid)
    logger.log?.(`[dev-server] Started with PID ${pid} (process group), logging to ${logFile}`)

    const actualPort = await waitForVite(workDir, requestedPort, logFile)
    return {
      success: true,
      actualPort,
      pid,
      message: `Dev server started successfully. DEV_SERVER_PORT=${actualPort}. Navigate to http://localhost:${actualPort}`,
      logFile,
    }
  } catch (error) {
    const message = `Failed to start dev server: ${
      error instanceof Error ? error.message : String(error)
    }`
    logger.error?.(`[dev-server] ${message}`)
    return { success: false, actualPort: requestedPort, pid: '', message, logFile }
  }
}

export const restartDevServer = async (
  workDir: string,
  requestedPort: string,
  logger: Logger = {},
): Promise<DevServerStartResult> => {
  const logFile = path.join(workDir, 'dev-server.log')
  const pidFile = path.join(workDir, '.dev-server.pid')

  logger.log?.('[dev-server] Restarting dev server...')
  await killDevServerForWorkDir(workDir, logger)
  await rm(path.join(workDir, 'node_modules/.vite'), { recursive: true, force: true })

  try {
    const { stdout } = await execAsync(
      `setsid npm run dev -- --port ${requestedPort} --force > "${logFile}" 2>&1 & echo $!`,
      { cwd: workDir, shell: '/bin/bash' },
    )
    const pid = stdout.trim()
    await writeFile(pidFile, pid)
    logger.log?.(`[dev-server] Restarted with PID ${pid} (process group), logging to ${logFile}`)

    const actualPort = await waitForVite(workDir, requestedPort, logFile)
    return {
      success: true,
      actualPort,
      pid,
      message: `Dev server restarted successfully. DEV_SERVER_PORT=${actualPort}. Navigate to http://localhost:${actualPort}`,
      logFile,
    }
  } catch (error) {
    const message = `Failed to restart dev server: ${
      error instanceof Error ? error.message : String(error)
    }`
    logger.error?.(`[dev-server] ${message}`)
    return { success: false, actualPort: requestedPort, pid: '', message, logFile }
  }
}
