/**
 * Stax CLI Auth — persistent key storage + login flow
 *
 * Key resolution order:
 *   1. STAX_API_KEY env var (CI/scripts/agent override)
 *   2. ~/.stax/config.json (persisted from `stax login`)
 *   3. Prompt user to login
 *
 * Login options:
 *   - Open browser → staxlabs.org login → shows key → paste back
 *   - Direct paste if they already have a key
 *   - One-liner: stax login --key sk_...
 */

import * as p from '@clack/prompts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const CONFIG_DIR = join(homedir(), '.stax')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const AUTH_URL = 'https://staxlabs.org/labs/home?view=profile'

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

// ─── Login Flow (interactive) ─────────────────────────────────────────────────

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
        label: 'Open Stax Labs in browser',
        hint: 'log in → Profile → API tab → copy key',
      },
      {
        value: 'paste',
        label: 'Paste an API key',
        hint: 'if you already have one',
      },
      {
        value: 'url',
        label: 'Show me the URL',
        hint: 'for manual browser opening',
      },
    ],
  })

  if (p.isCancel(method)) { p.cancel('Login cancelled.'); return }

  if (method === 'browser') {
    p.log.step(`Opening ${AUTH_URL}`)
    // Try to open browser
    const { exec } = await import('child_process')
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
    exec(`${cmd} "${AUTH_URL}"`)
    p.log.info('Go to Profile → API tab → Create a key → Copy it')
  } else if (method === 'url') {
    p.note(AUTH_URL, 'Open this URL in your browser')
    p.log.info('Go to Profile → API tab → Create a key → Copy it')
  }

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
