/**
 * Stax Labs CLI
 *
 * Build, backtest, deploy, and manage investment strategies from your terminal.
 *
 * Usage:
 *   stax backtest strategy.json [--start 2022-01-01] [--end 2024-12-31] [--capital 100000]
 *   stax screen --roe ">15" --pe "<20" [--date 2024-12-31]
 *   stax strategies [list|get|delete] [--search value]
 *   stax deploy strategy.json [--name "My Deploy"] [--capital 10000]
 *   stax deployments [list|get|stop|pause|resume]
 *   stax account
 *   stax keys [list|create|revoke]
 *   stax community [--sort sharpe] [--limit 10]
 */

const API = 'https://api.staxlabs.org/api/v1'
const VERSION = '0.1.0'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getKey(): string {
  const key = process.env.STAX_API_KEY
  if (!key) {
    console.error('Error: STAX_API_KEY not set.')
    console.error('  export STAX_API_KEY=sk_...')
    process.exit(1)
  }
  return key
}

async function api(method: string, path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getKey()}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json() as Record<string, unknown>
  if (!res.ok || data.success === false) {
    console.error(`Error ${res.status}: ${data.error || 'Unknown error'}`)
    process.exit(1)
  }
  return data
}

function print(data: unknown) {
  console.log(JSON.stringify(data, null, 2))
}

function readJsonFile(path: string): unknown {
  const fs = require('fs')
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  } catch {
    console.error(`Error: Cannot read ${path}`)
    process.exit(1)
  }
}

// ─── Metric shortcuts for screen ──────────────────────────────────────────────

const METRIC_SHORTCUTS: Record<string, string> = {
  '--roe': 'return_on_equity',
  '--pe': 'price_to_earnings_ratio',
  '--pb': 'price_to_book_ratio',
  '--ps': 'price_to_sales_ratio',
  '--de': 'debt_to_equity_ratio',
  '--mcap': 'market_cap',
  '--margin': 'net_profit_margin',
  '--roic': 'return_on_invested_capital',
  '--fcf': 'free_cash_flow_yield',
  '--div': 'dividend_yield',
  '--cr': 'current_ratio',
  '--sharpe': 'avg_sharpe_ratio',
}

function parseFilterValue(val: string): { operator: string; value: number; value2?: number } {
  if (val.includes('..')) {
    const [a, b] = val.split('..')
    return { operator: 'between', value: Number(a), value2: Number(b) }
  }
  if (val.startsWith('>=')) return { operator: 'gte', value: Number(val.slice(2)) }
  if (val.startsWith('>'))  return { operator: 'gt', value: Number(val.slice(1)) }
  if (val.startsWith('<=')) return { operator: 'lte', value: Number(val.slice(2)) }
  if (val.startsWith('<'))  return { operator: 'lt', value: Number(val.slice(1)) }
  if (val.startsWith('='))  return { operator: 'eq', value: Number(val.slice(1)) }
  return { operator: 'gte', value: Number(val) }
}

function parseArgs(args: string[]): { positional: string[]; flags: Record<string, string> } {
  const positional: string[] = []
  const flags: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i]!.startsWith('--')) {
      const key = args[i]!
      const next = args[i + 1]
      if (next && !next.startsWith('--')) {
        flags[key] = next
        i++
      } else {
        flags[key] = 'true'
      }
    } else {
      positional.push(args[i]!)
    }
  }
  return { positional, flags }
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function cmdBacktest(args: string[]) {
  const { positional, flags } = parseArgs(args)
  const file = positional[0]
  if (!file) {
    console.error('Usage: stax backtest <strategy.json> [--start DATE] [--end DATE] [--capital NUM]')
    process.exit(1)
  }

  const strategyData = readJsonFile(file) as Record<string, unknown>
  const strategy = strategyData.strategy || strategyData

  const body = {
    strategy,
    startDate: flags['--start'] || '2022-01-01',
    endDate: flags['--end'] || '2024-12-31',
    initialCapital: Number(flags['--capital'] || '100000'),
  }

  console.log(`Running backtest: ${body.startDate} to ${body.endDate}, $${body.initialCapital.toLocaleString()}...`)
  const data = await api('POST', '/backtest', body) as Record<string, unknown>
  const result = data.result as Record<string, unknown>
  const metrics = result.metrics as Record<string, unknown> || result.performance as Record<string, unknown> || {}
  const meta = result.meta as Record<string, unknown> || {}

  console.log('')
  console.log(`Backtest Complete (${meta.executionTimeMs || '?'}ms)`)
  console.log('─'.repeat(40))

  const fmt = (label: string, v: unknown, pct = false) => {
    if (v === undefined || v === null) return
    const n = Number(v)
    const display = pct ? `${(n * 100).toFixed(1)}%` : n.toFixed(2)
    console.log(`  ${label.padEnd(20)} ${display}`)
  }

  fmt('Total Return', metrics.totalReturn, true)
  fmt('Annual Return', metrics.annualizedReturn, true)
  fmt('Sharpe Ratio', metrics.sharpeRatio)
  fmt('Sortino Ratio', metrics.sortinoRatio)
  fmt('Max Drawdown', metrics.maxDrawdown, true)
  // winRate comes from engine as percentage (33.3) not decimal (0.333)
  if (metrics.winRate !== undefined) {
    const wr = Number(metrics.winRate)
    console.log(`  ${'Win Rate'.padEnd(20)} ${wr > 1 ? wr.toFixed(1) : (wr * 100).toFixed(1)}%`)
  }
  fmt('Profit Factor', metrics.profitFactor)
  console.log(`  ${'Trades'.padEnd(20)} ${(result.trades as unknown[])?.length ?? '?'}`)
  console.log(`  ${'Trading Days'.padEnd(20)} ${meta.tradingDays ?? '?'}`)
  console.log(`  ${'Symbols Screened'.padEnd(20)} ${meta.symbolsScreened ?? '?'}`)
}

async function cmdScreen(args: string[]) {
  const { flags } = parseArgs(args)
  const filters: Array<Record<string, unknown>> = []

  for (const [flag, val] of Object.entries(flags)) {
    const metric = METRIC_SHORTCUTS[flag]
    if (metric && val !== 'true') {
      const parsed = parseFilterValue(val)
      filters.push({ metric, ...parsed })
    }
  }

  if (filters.length === 0) {
    console.error('Usage: stax screen --roe ">15" --pe "<20" [--date 2024-12-31]')
    console.error('Shortcuts: --roe, --pe, --pb, --ps, --de, --mcap, --margin, --roic, --fcf, --div, --cr')
    process.exit(1)
  }

  const body: Record<string, unknown> = { filters }
  if (flags['--date']) body.asOfDate = flags['--date']

  const data = await api('POST', '/screen', body) as Record<string, unknown>
  const result = data.result as Record<string, unknown>
  const symbols = result.passedSymbols as string[]

  console.log(`${symbols.length} stocks passed:`)
  // Print in columns
  const cols = 6
  for (let i = 0; i < symbols.length; i += cols) {
    console.log('  ' + symbols.slice(i, i + cols).map(s => s.padEnd(8)).join(''))
  }
}

async function cmdStrategies(args: string[]) {
  const { positional, flags } = parseArgs(args)
  const sub = positional[0] || 'list'

  if (sub === 'list') {
    const params = new URLSearchParams()
    if (flags['--search']) params.set('search', flags['--search'])
    if (flags['--limit']) params.set('limit', flags['--limit'])
    const data = await api('GET', `/strategies?${params}`) as Record<string, unknown>
    const strategies = data.strategies as Array<Record<string, unknown>>
    console.log(`${(data.pagination as Record<string, unknown>)?.total ?? strategies.length} strategies:`)
    for (const s of strategies) {
      console.log(`  ${(s.name as string).padEnd(30)} ${s.total_backtests || 0} backtests  ${s.id}`)
    }
  } else if (sub === 'get') {
    const id = positional[1]
    if (!id) { console.error('Usage: stax strategies get <id>'); process.exit(1) }
    const data = await api('GET', `/strategies/${id}`) as Record<string, unknown>
    print(data.strategy)
  } else if (sub === 'delete') {
    const id = positional[1]
    if (!id) { console.error('Usage: stax strategies delete <id>'); process.exit(1) }
    await api('DELETE', `/strategies/${id}`)
    console.log('Deleted.')
  }
}

async function cmdDeploy(args: string[]) {
  const { positional, flags } = parseArgs(args)
  const file = positional[0]
  if (!file) {
    console.error('Usage: stax deploy <strategy.json> [--name "My Deploy"] [--capital 10000]')
    process.exit(1)
  }

  const strategyData = readJsonFile(file) as Record<string, unknown>
  const strategy = strategyData.strategy || strategyData

  const body = {
    strategy,
    display_name: flags['--name'] || 'CLI Deployment',
    initial_capital: Number(flags['--capital'] || '10000'),
  }

  const data = await api('POST', '/deploy', body) as Record<string, unknown>
  const dep = data.deployment as Record<string, unknown>
  console.log(`Deployed: ${dep.display_name} (${dep.id})`)
  console.log(`  Status: ${dep.status} | Capital: $${dep.initial_capital}`)
}

async function cmdDeployments(args: string[]) {
  const { positional } = parseArgs(args)
  const sub = positional[0] || 'list'

  if (sub === 'list') {
    const data = await api('GET', '/deployments') as Record<string, unknown>
    const deps = data.deployments as Array<Record<string, unknown>>
    if (deps.length === 0) { console.log('No deployments.'); return }
    for (const d of deps) {
      const ret = d.total_return_pct != null ? `${(d.total_return_pct as number).toFixed(1)}%` : 'n/a'
      console.log(`  ${(d.display_name as string).padEnd(30)} ${(d.status as string).padEnd(8)} $${d.current_value}  ${ret}  ${d.id}`)
    }
  } else if (['stop', 'pause', 'resume'].includes(sub)) {
    const id = positional[1]
    if (!id) { console.error(`Usage: stax deployments ${sub} <id>`); process.exit(1) }
    await api('POST', `/deployments/${id}/${sub}`)
    console.log(`${sub.charAt(0).toUpperCase() + sub.slice(1)}d.`)
  } else if (sub === 'get') {
    const id = positional[1]
    if (!id) { console.error('Usage: stax deployments get <id>'); process.exit(1) }
    const data = await api('GET', `/deployments/${id}`) as Record<string, unknown>
    print(data)
  }
}

async function cmdAccount() {
  const data = await api('GET', '/account') as Record<string, unknown>
  const acct = data.account as Record<string, unknown>
  const apiInfo = acct.api as Record<string, unknown>
  console.log(`Tier: ${acct.tier}`)
  console.log(`Rate limit: ${apiInfo.requests_today}/${apiInfo.rate_limit_per_day} used today (${apiInfo.requests_remaining} remaining)`)
  console.log(`API keys: ${apiInfo.active_keys}/${apiInfo.max_keys}`)
}

async function cmdKeys(args: string[]) {
  const { positional, flags } = parseArgs(args)
  const sub = positional[0] || 'list'

  if (sub === 'list') {
    const data = await api('GET', '/account/keys') as Record<string, unknown>
    const keys = data.keys as Array<Record<string, unknown>>
    for (const k of keys) {
      console.log(`  ${(k.name as string).padEnd(20)} ${k.key_prefix}...  ${k.requests_today}/${k.rate_limit_per_day} today`)
    }
  } else if (sub === 'create') {
    const name = flags['--name'] || 'CLI Key'
    const data = await api('POST', '/account/keys', { name }) as Record<string, unknown>
    const key = data.key as Record<string, unknown>
    console.log(`Key created: ${key.key}`)
    console.log('Store this key securely — it will not be shown again.')
  } else if (sub === 'revoke') {
    const id = positional[1]
    if (!id) { console.error('Usage: stax keys revoke <id>'); process.exit(1) }
    await api('DELETE', `/account/keys/${id}`)
    console.log('Key revoked.')
  }
}

async function cmdCommunity(args: string[]) {
  const { flags } = parseArgs(args)
  const params = new URLSearchParams()
  if (flags['--sort']) params.set('sort', flags['--sort'])
  if (flags['--limit']) params.set('limit', flags['--limit'])

  const data = await api('GET', `/community/strategies?${params}`) as Record<string, unknown>
  const strategies = data.strategies as Array<Record<string, unknown>>
  for (const s of strategies) {
    const sharpe = s.avg_sharpe_ratio != null ? (s.avg_sharpe_ratio as number).toFixed(2) : 'n/a'
    console.log(`  ${(s.name as string).padEnd(30)} sharpe: ${sharpe.padEnd(6)} ${s.total_backtests || 0} backtests  ${s.id}`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const HELP = `
Stax Labs CLI v${VERSION}

Usage: stax <command> [options]

Commands:
  backtest <file.json>     Run a backtest
  screen                   Screen the stock universe
  strategies               Manage saved strategies
  deploy <file.json>       Deploy for paper trading
  deployments              Manage deployments
  account                  View account info
  keys                     Manage API keys
  community                Browse public strategies

Examples:
  stax backtest strategy.json --start 2022-01-01 --end 2024-12-31
  stax screen --roe ">15" --pe "<20" --mcap ">10000000000"
  stax strategies list --search "value"
  stax deploy strategy.json --name "My Paper Trade" --capital 50000
  stax deployments list
  stax account
  stax community --sort sharpe --limit 5

Environment:
  STAX_API_KEY    Your API key (sk_...)

Docs: https://staxlabs.org/docs
Skill: git clone https://github.com/Stax-app/stax-skill.git ~/.claude/skills/stax
`

async function main() {
  const args = process.argv.slice(2)
  const cmd = args[0]
  const rest = args.slice(1)

  switch (cmd) {
    case 'backtest':    return cmdBacktest(rest)
    case 'screen':      return cmdScreen(rest)
    case 'strategies':  return cmdStrategies(rest)
    case 'deploy':      return cmdDeploy(rest)
    case 'deployments': return cmdDeployments(rest)
    case 'account':     return cmdAccount()
    case 'keys':        return cmdKeys(rest)
    case 'community':   return cmdCommunity(rest)
    case '--version':
    case '-v':          console.log(VERSION); return
    case '--help':
    case '-h':
    case undefined:     console.log(HELP); return
    default:
      console.error(`Unknown command: ${cmd}`)
      console.log(HELP)
      process.exit(1)
  }
}

main().catch(err => {
  console.error('Fatal:', err.message || err)
  process.exit(1)
})
