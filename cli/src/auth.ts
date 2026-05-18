/**
 * Stax CLI Auth — persistent key storage + browser-based login
 *
 * Key resolution order:
 *   1. STAX_API_KEY env var (CI/scripts/agent override)
 *   2. ~/.stax/config.json (persisted from `stax login`)
 *   3. Prompt user to login
 *
 * Login flow (like Claude/Codex):
 *   1. CLI starts local HTTP server on random port
 *   2. Opens browser to staxlabs.org/labs/cli-auth?callback=http://localhost:PORT
 *   3. User signs in with Google → API key auto-created
 *   4. Page redirects to localhost callback with the key
 *   5. CLI catches key, validates, saves — zero pasting
 */

import * as p from '@clack/prompts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { createServer } from 'http'

const CONFIG_DIR = join(homedir(), '.stax')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const AUTH_URL = 'https://staxlabs.org/labs/cli-auth'

// ─── Config File ──────────────────────────────────────────────────────────────

interface StaxConfig {
  api_key?: string
  saved_at?: string
}

function readConfig(): StaxConfig {
  try {
    if (existsSync(CONFIG_FILE)) {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf8'))
    }
  } catch { /* corrupt file, start fresh */ }
  return {}
}

function writeConfig(config: StaxConfig) {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

// ─── Get Key (silent — for commands) ──────────────────────────────────────────

export function getKey(): string {
  // 1. Env var (highest priority — agents/CI)
  if (process.env.STAX_API_KEY) return process.env.STAX_API_KEY

  // 2. Config file
  const config = readConfig()
  if (config.api_key) return config.api_key

  // 3. Not logged in
  console.error('Not logged in. Run: stax login')
  process.exit(1)
}

export function isLoggedIn(): boolean {
  return !!(process.env.STAX_API_KEY || readConfig().api_key)
}

// ─── Local callback server ───────────────────────────────────────────────────

function startCallbackServer(): Promise<{ port: number; waitForKey: () => Promise<string> }> {
  return new Promise((resolve, reject) => {
    let keyResolve: (key: string) => void

    const keyPromise = new Promise<string>((res) => { keyResolve = res })

    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://localhost`)
      const key = url.searchParams.get('key')

      if (key) {
        // Success — send a nice page and close
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`<!DOCTYPE html>
<html><head><title>Stax CLI</title><style>
  body { background: #0a0a0f; color: white; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { text-align: center; padding: 3rem; }
  .check { color: #10b981; font-size: 3rem; margin-bottom: 1rem; }
  h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
  p { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin: 0; }
</style></head><body>
<div class="card">
  <div class="check">&#10003;</div>
  <h1>CLI Connected</h1>
  <p>You can close this tab and return to your terminal.</p>
</div>
</body></html>`)

        keyResolve!(key)
        setTimeout(() => server.close(), 500)
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('Missing key parameter')
      }
    })

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address()
      if (!addr || typeof addr === 'string') { reject(new Error('Failed to start server')); return }
      resolve({ port: addr.port, waitForKey: () => keyPromise })
    })

    server.on('error', reject)

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close()
      reject(new Error('Login timed out. Try again.'))
    }, 5 * 60 * 1000)
  })
}

// ─── Login Flow ──────────────────────────────────────────────────────────────

export async function loginFlow(args: string[]) {
  // One-liner: stax login --key sk_...
  const keyIdx = args.indexOf('--key')
  if (keyIdx !== -1 && args[keyIdx + 1]) {
    const key = args[keyIdx + 1]!
    if (!key.startsWith('sk_')) {
      p.cancel('Invalid key format. Expected: sk_<id>_<secret>')
      process.exit(1)
    }
    await validateAndSave(key)
    return
  }

  p.intro('Stax Login')

  // Check if already logged in
  const existing = readConfig()
  if (existing.api_key) {
    const prefix = existing.api_key.slice(0, 11) + '...'
    const overwrite = await p.confirm({
      message: `Already logged in (${prefix}). Replace?`,
    })
    if (p.isCancel(overwrite) || !overwrite) {
      p.outro('Keeping existing key.')
      return
    }
  }

  const method = await p.select({
    message: 'How do you want to authenticate?',
    options: [
      {
        value: 'browser',
        label: 'Sign in with browser',
        hint: 'opens browser, auto-connects — recommended',
      },
      {
        value: 'paste',
        label: 'Paste an API key',
        hint: 'if you already have one',
      },
    ],
  })

  if (p.isCancel(method)) { p.cancel('Login cancelled.'); return }

  if (method === 'browser') {
    await browserLogin()
    return
  }

  // Paste mode
  const key = await p.text({
    message: 'Paste your API key:',
    placeholder: 'sk_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    validate: (v) => {
      if (!v.startsWith('sk_')) return 'Key must start with sk_'
      if (v.split('_').length !== 3) return 'Invalid format. Expected: sk_<id>_<secret>'
      return undefined
    },
  })

  if (p.isCancel(key)) { p.cancel('Login cancelled.'); return }
  await validateAndSave(key as string)
}

async function browserLogin() {
  const spin = p.spinner()
  spin.start('Starting login server...')

  try {
    const { port, waitForKey } = await startCallbackServer()
    const callbackUrl = `http://localhost:${port}/callback`
    const loginUrl = `${AUTH_URL}?callback=${encodeURIComponent(callbackUrl)}`

    spin.stop('Waiting for browser sign-in...')
    p.log.info('If the browser didn\'t open, visit:')
    p.log.message(`  ${loginUrl}`)

    // Open browser
    const { exec } = await import('child_process')
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
    exec(`${cmd} "${loginUrl}"`)

    const spin2 = p.spinner()
    spin2.start('Waiting for authorization...')

    const key = await waitForKey()
    spin2.stop('Authorized!')

    await validateAndSave(key)
  } catch (err) {
    spin.stop('Login failed')
    p.log.error(err instanceof Error ? err.message : 'Browser login failed')

    // Fallback to paste
    p.log.info('Falling back to manual key entry.')
    const key = await p.text({
      message: 'Paste your API key:',
      placeholder: 'sk_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      validate: (v) => {
        if (!v.startsWith('sk_')) return 'Key must start with sk_'
        return undefined
      },
    })
    if (p.isCancel(key)) return
    await validateAndSave(key as string)
  }
}

async function validateAndSave(key: string) {
  const spin = p.spinner()
  spin.start('Validating key...')

  try {
    const res = await fetch(`https://api.staxlabs.org/api/v1/account`, {
      headers: { 'Authorization': `Bearer ${key}` },
    })
    const data = await res.json() as Record<string, unknown>

    if (!res.ok || data.success === false) {
      spin.stop('Invalid key')
      p.log.error(data.error as string || 'Key validation failed')
      process.exit(1)
    }

    const acct = data.account as Record<string, unknown>
    const apiInfo = acct.api as Record<string, unknown>

    writeConfig({ api_key: key, saved_at: new Date().toISOString() })
    spin.stop('Logged in!')

    p.note(
      `  Tier:      ${String(acct.tier).toUpperCase()}\n` +
      `  Requests:  ${apiInfo.requests_remaining}/${apiInfo.rate_limit_per_day} remaining\n` +
      `  Keys:      ${apiInfo.active_keys}/${apiInfo.max_keys}\n` +
      `  Saved to:  ~/.stax/config.json`,
      'Welcome to Stax'
    )
  } catch (err) {
    spin.stop('Connection failed')
    p.log.error(err instanceof Error ? err.message : 'Could not reach API')
    process.exit(1)
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function logout() {
  const config = readConfig()
  if (config.api_key) {
    writeConfig({})
    p.log.success('Logged out. Key removed from ~/.stax/config.json')
  } else {
    p.log.info('Not logged in.')
  }
}

// ─── Status ───────────────────────────────────────────────────────────────────

export function showAuthStatus() {
  if (process.env.STAX_API_KEY) {
    const prefix = process.env.STAX_API_KEY.slice(0, 11) + '...'
    p.log.info(`Using env: STAX_API_KEY=${prefix}`)
    return
  }
  const config = readConfig()
  if (config.api_key) {
    const prefix = config.api_key.slice(0, 11) + '...'
    p.log.info(`Logged in: ${prefix} (saved ${config.saved_at ?? 'unknown'})`)
  } else {
    p.log.warn('Not logged in. Run: stax login')
  }
}
