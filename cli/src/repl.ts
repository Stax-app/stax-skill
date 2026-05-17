/**
 * Stax Interactive CLI — powered by @clack/prompts
 *
 * Beautiful guided flows for strategy building.
 * Launch with `stax` (no args).
 */

import * as p from '@clack/prompts'

import { getKey, isLoggedIn, loginFlow } from './auth'

const API = 'https://api.staxlabs.org/api/v1'

// ─── State ────────────────────────────────────────────────────────────────────

interface Filter { metric: string; operator: string; value: number; value2?: number }
interface Run { metrics: Record<string, unknown>; trades: number; time: number }

const state = {
  filters: [] as Filter[],
  topN: 10,
  momentum: 50,
  lookback: 6,
  stop: 0.20 as number | null,
  trail: null as number | null,
  tp: null as number | null,
  maxDD: 0.35,
  rebal: 'monthly',
  recon: 'quarterly',
  weight: 'equal',
  maxPos: 0.20,
  minPos: 0.02,
  start: '2022-01-01',
  end: '2024-12-31',
  capital: 100000,
  lastRun: null as Run | null,
  prevRun: null as Run | null,
  savedId: null as string | null,
}

// ─── API ──────────────────────────────────────────────────────────────────────

// getKey imported from ./auth — resolves env var → config file → exit

async function api(method: string, path: string, body?: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getKey()}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json() as Record<string, unknown>
  if (!res.ok || data.success === false) throw new Error(data.error as string || `API ${res.status}`)
  return data
}

// ─── Shortcuts ────────────────────────────────────────────────────────────────

const METRICS: Record<string, { name: string; metric: string; hint: string }> = {
  'ROE (Return on Equity)':      { name: 'ROE', metric: 'return_on_equity', hint: '% — higher is better' },
  'P/E (Price to Earnings)':     { name: 'P/E', metric: 'price_to_earnings_ratio', hint: 'ratio — lower is cheaper' },
  'P/B (Price to Book)':         { name: 'P/B', metric: 'price_to_book_ratio', hint: 'ratio — lower is cheaper' },
  'Market Cap':                   { name: 'MCap', metric: 'market_cap', hint: '$ — e.g. 10000000000 = $10B' },
  'Debt/Equity':                  { name: 'D/E', metric: 'debt_to_equity_ratio', hint: 'ratio — lower is safer' },
  'Net Margin':                   { name: 'Margin', metric: 'net_profit_margin', hint: '% — higher is better' },
  'ROIC':                         { name: 'ROIC', metric: 'return_on_invested_capital', hint: '% — higher is better' },
  'Dividend Yield':               { name: 'Div', metric: 'dividend_yield', hint: '% — higher for income' },
  'Current Ratio':                { name: 'CR', metric: 'current_ratio', hint: 'ratio — >1.5 is healthy' },
  'FCF Yield':                    { name: 'FCF', metric: 'free_cash_flow_yield', hint: '% — higher is better' },
  'Gross Margin':                 { name: 'GPM', metric: 'gross_profit_margin', hint: '% — higher is better' },
  'EV/EBITDA':                    { name: 'EV/EBITDA', metric: 'ev_to_ebitda', hint: 'ratio — lower is cheaper' },
}

// ─── Build Strategy Object ────────────────────────────────────────────────────

function buildStrategy(): Record<string, unknown> {
  return {
    schemaVersion: 4,
    fundamentalFilters: state.filters.map(f => ({
      metric: f.metric, operator: f.operator, value: f.value, ...(f.value2 !== undefined && { value2: f.value2 }),
    })),
    ranking: { momentumWeight: state.momentum, fundamentalWeight: 100 - state.momentum, momentumLookback: state.lookback, topN: state.topN },
    positionSizing: { maxPositionSize: state.maxPos, minPositionSize: state.minPos },
    riskManagement: { hardStopLoss: state.stop, trailingStopLoss: state.trail, takeProfit: state.tp, maxDrawdown: state.maxDD, exitFailedImmediately: true },
    rebalancing: { frequency: state.rebal, weightingMethod: state.weight, reconstitutionFrequency: state.recon },
    tradingCosts: { commission: { type: 'per_share', value: 0.005 }, slippage: { type: 'percentage', value: 0.001 } },
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function fmtPct(n: number): string {
  return n > 1 ? `${n.toFixed(1)}%` : `${(n * 100).toFixed(1)}%`
}

function fmtMetrics(m: Record<string, unknown>): string {
  const lines: string[] = []
  const add = (label: string, key: string, pct = false) => {
    const v = m[key]
    if (v === undefined || v === null) return
    lines.push(`  ${label.padEnd(18)} ${pct ? fmtPct(Number(v)) : Number(v).toFixed(2)}`)
  }
  add('Total Return', 'totalReturn', true)
  add('Annual Return', 'annualizedReturn', true)
  add('Sharpe Ratio', 'sharpeRatio')
  add('Sortino Ratio', 'sortinoRatio')
  add('Max Drawdown', 'maxDrawdown', true)
  add('Win Rate', 'winRate', true)
  add('Profit Factor', 'profitFactor')
  return lines.join('\n')
}

// ─── Flows ────────────────────────────────────────────────────────────────────

async function addFilterFlow() {
  const metricChoice = await p.select({
    message: 'Which metric?',
    options: Object.entries(METRICS).map(([label, m]) => ({
      value: m.metric, label, hint: m.hint,
    })),
  })
  if (p.isCancel(metricChoice)) return

  const op = await p.select({
    message: 'Operator?',
    options: [
      { value: 'gte', label: '≥  greater than or equal' },
      { value: 'gt', label: '>  greater than' },
      { value: 'lte', label: '≤  less than or equal' },
      { value: 'lt', label: '<  less than' },
      { value: 'between', label: '↔  between (range)' },
    ],
  })
  if (p.isCancel(op)) return

  const val = await p.text({
    message: op === 'between' ? 'Min value:' : 'Value:',
    validate: (v) => isNaN(Number(v)) ? 'Must be a number' : undefined,
  })
  if (p.isCancel(val)) return

  let val2: string | symbol | undefined
  if (op === 'between') {
    val2 = await p.text({
      message: 'Max value:',
      validate: (v) => isNaN(Number(v)) ? 'Must be a number' : undefined,
    })
    if (p.isCancel(val2)) return
  }

  // Remove existing filter for same metric
  state.filters = state.filters.filter(f => f.metric !== metricChoice)
  state.filters.push({
    metric: metricChoice as string,
    operator: op as string,
    value: Number(val),
    ...(val2 !== undefined && { value2: Number(val2) }),
  })

  const name = Object.values(METRICS).find(m => m.metric === metricChoice)?.name ?? metricChoice
  p.log.success(`Added: ${name} ${op} ${val}${val2 ? `..${val2}` : ''}`)
}

async function runBacktest() {
  if (state.filters.length === 0) {
    p.log.warn('Add at least one filter first.')
    return
  }

  const spin = p.spinner()
  spin.start(`Running backtest: ${state.start} → ${state.end}, $${state.capital.toLocaleString()}`)

  try {
    const data = await api('POST', '/backtest', {
      strategy: buildStrategy(),
      startDate: state.start, endDate: state.end, initialCapital: state.capital,
    })

    const result = data.result as Record<string, unknown>
    const metrics = result.metrics as Record<string, unknown> ?? {}
    const meta = result.meta as Record<string, unknown> ?? {}
    const trades = (result.trades as unknown[])?.length ?? 0

    spin.stop(`Done in ${((Number(meta.executionTimeMs) || 0) / 1000).toFixed(1)}s — ${meta.symbolsScreened} symbols screened`)

    state.prevRun = state.lastRun
    state.lastRun = { metrics, trades, time: Number(meta.executionTimeMs) || 0 }

    p.note(
      fmtMetrics(metrics) + `\n  ${'Trades'.padEnd(18)} ${trades}`,
      'Results'
    )

    if (state.prevRun) {
      p.log.info('Run "compare" to see changes from last backtest.')
    }
  } catch (err) {
    spin.stop('Backtest failed')
    p.log.error(err instanceof Error ? err.message : String(err))
  }
}

async function compareRuns() {
  if (!state.lastRun || !state.prevRun) {
    p.log.warn('Need 2 backtests to compare. Run backtest twice.')
    return
  }

  const a = state.prevRun.metrics
  const b = state.lastRun.metrics
  const lines: string[] = []

  const row = (label: string, key: string, pct = false) => {
    const va = Number(a[key] ?? 0)
    const vb = Number(b[key] ?? 0)
    const fmt = (n: number) => pct ? fmtPct(n) : n.toFixed(2)
    const delta = vb - va
    const arrow = delta > 0.001 ? '▲' : delta < -0.001 ? '▼' : '='
    lines.push(`  ${label.padEnd(16)} ${fmt(va).padEnd(10)} → ${fmt(vb).padEnd(10)} ${arrow}`)
  }

  row('Total Return', 'totalReturn', true)
  row('Sharpe', 'sharpeRatio')
  row('Max Drawdown', 'maxDrawdown', true)
  row('Win Rate', 'winRate', true)
  row('Profit Factor', 'profitFactor')
  lines.push(`  ${'Trades'.padEnd(16)} ${String(state.prevRun.trades).padEnd(10)} → ${String(state.lastRun.trades).padEnd(10)}`)

  p.note(lines.join('\n'), 'Previous → Current')
}

async function tweakFlow() {
  if (state.filters.length === 0) {
    p.log.warn('No filters to tweak. Add some first.')
    return
  }

  const choice = await p.select({
    message: 'Which filter to tweak?',
    options: state.filters.map(f => {
      const name = Object.values(METRICS).find(m => m.metric === f.metric)?.name ?? f.metric
      return { value: f.metric, label: `${name} ${f.operator} ${f.value}` }
    }),
  })
  if (p.isCancel(choice)) return

  const filter = state.filters.find(f => f.metric === choice)!
  const newVal = await p.text({
    message: `New value (currently ${filter.value}):`,
    validate: (v) => isNaN(Number(v)) ? 'Must be a number' : undefined,
  })
  if (p.isCancel(newVal)) return

  const old = filter.value
  filter.value = Number(newVal)
  const name = Object.values(METRICS).find(m => m.metric === choice)?.name ?? choice
  p.log.step(`${name}: ${old} → ${filter.value}`)

  await runBacktest()
}

async function settingsFlow() {
  const param = await p.select({
    message: 'What to change?',
    options: [
      { value: 'period', label: 'Backtest Period', hint: `${state.start} → ${state.end}` },
      { value: 'capital', label: 'Capital', hint: `$${state.capital.toLocaleString()}` },
      { value: 'topn', label: 'Holdings (topN)', hint: String(state.topN) },
      { value: 'momentum', label: 'Momentum/Fundamental split', hint: `${state.momentum}/${100 - state.momentum}` },
      { value: 'risk', label: 'Risk Management', hint: `stop=${state.stop ?? 'off'} trail=${state.trail ?? 'off'}` },
      { value: 'rebal', label: 'Rebalancing', hint: `${state.rebal} / ${state.recon}` },
    ],
  })
  if (p.isCancel(param)) return

  switch (param) {
    case 'period': {
      const start = await p.text({ message: 'Start date:', initialValue: state.start })
      if (p.isCancel(start)) return
      const end = await p.text({ message: 'End date:', initialValue: state.end })
      if (p.isCancel(end)) return
      state.start = start; state.end = end
      break
    }
    case 'capital': {
      const val = await p.text({ message: 'Initial capital ($):', initialValue: String(state.capital) })
      if (p.isCancel(val)) return
      state.capital = Number(String(val).replace(/,/g, ''))
      break
    }
    case 'topn': {
      const val = await p.text({ message: 'Number of stocks to hold:', initialValue: String(state.topN) })
      if (p.isCancel(val)) return
      state.topN = Number(val)
      break
    }
    case 'momentum': {
      const val = await p.text({ message: 'Momentum weight (0-100, remainder goes to fundamental):', initialValue: String(state.momentum) })
      if (p.isCancel(val)) return
      state.momentum = Number(val)
      break
    }
    case 'risk': {
      const stop = await p.text({ message: 'Hard stop loss (0.01-0.50, or "off"):', initialValue: state.stop != null ? String(state.stop) : 'off' })
      if (p.isCancel(stop)) return
      state.stop = stop === 'off' ? null : Number(stop)
      const trail = await p.text({ message: 'Trailing stop (or "off"):', initialValue: state.trail != null ? String(state.trail) : 'off' })
      if (p.isCancel(trail)) return
      state.trail = trail === 'off' ? null : Number(trail)
      const tp = await p.text({ message: 'Take profit (or "off"):', initialValue: state.tp != null ? String(state.tp) : 'off' })
      if (p.isCancel(tp)) return
      state.tp = tp === 'off' ? null : Number(tp)
      const maxdd = await p.text({ message: 'Max drawdown circuit breaker:', initialValue: String(state.maxDD) })
      if (p.isCancel(maxdd)) return
      state.maxDD = Number(maxdd)
      break
    }
    case 'rebal': {
      const freq = await p.select({ message: 'Rebalance frequency:', options: [
        { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' },
      ]})
      if (p.isCancel(freq)) return
      state.rebal = freq as string
      const recon = await p.select({ message: 'Reconstitution frequency:', options: [
        { value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' },
        { value: 'semi-annual', label: 'Semi-Annual' }, { value: 'annual', label: 'Annual' },
      ]})
      if (p.isCancel(recon)) return
      state.recon = recon as string
      break
    }
  }
  p.log.success('Settings updated.')
}

async function screenFlow() {
  if (state.filters.length === 0) { p.log.warn('Add filters first.'); return }

  const spin = p.spinner()
  spin.start('Screening universe...')

  try {
    const data = await api('POST', '/screen', { filters: state.filters })
    const result = data.result as Record<string, unknown>
    const symbols = result.passedSymbols as string[]
    spin.stop(`${symbols.length} stocks passed`)

    if (symbols.length > 0) {
      const display = symbols.slice(0, 40)
      const cols = 8
      const lines: string[] = []
      for (let i = 0; i < display.length; i += cols) {
        lines.push('  ' + display.slice(i, i + cols).map(s => s.padEnd(8)).join(''))
      }
      if (symbols.length > 40) lines.push(`  ... and ${symbols.length - 40} more`)
      p.note(lines.join('\n'), `${symbols.length} Stocks`)
    }
  } catch (err) {
    spin.stop('Screen failed')
    p.log.error(err instanceof Error ? err.message : String(err))
  }
}

async function saveFlow() {
  const name = await p.text({ message: 'Strategy name:', initialValue: 'My Strategy' })
  if (p.isCancel(name)) return

  const spin = p.spinner()
  spin.start('Saving...')
  try {
    const data = await api('POST', '/strategies', { name, parameters: buildStrategy() })
    const saved = data.strategy as Record<string, unknown>
    state.savedId = saved.id as string
    spin.stop(`Saved: ${saved.name}`)
    p.log.info(`ID: ${saved.id}`)
  } catch (err) {
    spin.stop('Save failed')
    p.log.error(err instanceof Error ? err.message : String(err))
  }
}

async function deployFlow() {
  const name = await p.text({ message: 'Deployment name:', initialValue: 'Paper Trade' })
  if (p.isCancel(name)) return
  const capital = await p.text({ message: 'Capital ($):', initialValue: String(state.capital) })
  if (p.isCancel(capital)) return

  const spin = p.spinner()
  spin.start('Deploying...')
  try {
    const data = await api('POST', '/deploy', {
      strategy: buildStrategy(), display_name: name, initial_capital: Number(String(capital).replace(/,/g, '')),
    })
    const dep = data.deployment as Record<string, unknown>
    spin.stop(`Deployed: ${dep.display_name}`)
    p.log.info(`ID: ${dep.id} | Status: ${dep.status} | $${dep.initial_capital}`)
  } catch (err) {
    spin.stop('Deploy failed')
    p.log.error(err instanceof Error ? err.message : String(err))
  }
}

async function showStatus() {
  const filtersText = state.filters.length > 0
    ? state.filters.map(f => {
        const name = Object.values(METRICS).find(m => m.metric === f.metric)?.name ?? f.metric
        return `  ${name} ${f.operator} ${f.value}${f.value2 !== undefined ? `..${f.value2}` : ''}`
      }).join('\n')
    : '  (none)'

  p.note(
    `Filters:\n${filtersText}\n\n` +
    `  Holdings: top ${state.topN} | Momentum: ${state.momentum}%\n` +
    `  Stop: ${state.stop ?? 'off'} | Trail: ${state.trail ?? 'off'} | TP: ${state.tp ?? 'off'} | MaxDD: ${state.maxDD}\n` +
    `  Rebalance: ${state.rebal} | Recon: ${state.recon}\n` +
    `  Period: ${state.start} → ${state.end} | $${state.capital.toLocaleString()}`,
    'Current Strategy'
  )
}

// ─── Main Loop ────────────────────────────────────────────────────────────────

export async function startRepl() {
  p.intro('Stax Labs')

  // Auto-login if not authenticated
  if (!isLoggedIn()) {
    p.log.warn('Not logged in yet.')
    await loginFlow([])
    if (!isLoggedIn()) { p.outro('Login required.'); return }
  }

  // Show account info
  try {
    const data = await api('GET', '/account')
    const acct = data.account as Record<string, unknown>
    const apiInfo = acct.api as Record<string, unknown>
    p.log.info(`${String(acct.tier).toUpperCase()} tier | ${apiInfo.requests_remaining} requests left`)
  } catch { /* continue without account info */ }

  while (true) {
    const action = await p.select({
      message: 'What do you want to do?',
      options: [
        { value: 'filter', label: '+ Add Filter', hint: `${state.filters.length} active` },
        { value: 'backtest', label: '▶ Run Backtest', hint: state.filters.length > 0 ? `${state.start} → ${state.end}` : 'add filters first' },
        { value: 'tweak', label: '↻ Tweak & Re-run', hint: 'change a filter value' },
        { value: 'compare', label: '⇄ Compare Runs', hint: state.lastRun && state.prevRun ? 'ready' : 'need 2 runs' },
        { value: 'screen', label: '⊞ Screen Universe', hint: 'see which stocks pass' },
        { value: 'settings', label: '⚙ Settings', hint: 'period, capital, risk, ranking' },
        { value: 'show', label: '◉ Show Strategy', hint: 'current configuration' },
        { value: 'save', label: '↑ Save Strategy' },
        { value: 'deploy', label: '◆ Deploy (Paper)', hint: 'start paper trading' },
        { value: 'strategies', label: '☰ My Strategies' },
        { value: 'deployments', label: '☰ My Deployments' },
        { value: 'community', label: '☰ Community' },
        { value: 'account', label: '◎ Account' },
        { value: 'quit', label: '✕ Quit' },
      ],
    })

    if (p.isCancel(action) || action === 'quit') {
      p.outro('See you next time.')
      return
    }

    switch (action) {
      case 'filter': await addFilterFlow(); break
      case 'backtest': await runBacktest(); break
      case 'tweak': await tweakFlow(); break
      case 'compare': await compareRuns(); break
      case 'screen': await screenFlow(); break
      case 'settings': await settingsFlow(); break
      case 'show': await showStatus(); break
      case 'save': await saveFlow(); break
      case 'deploy': await deployFlow(); break
      case 'strategies': {
        const data = await api('GET', '/strategies?limit=10')
        const strats = data.strategies as Array<Record<string, unknown>>
        if (strats.length === 0) { p.log.info('No saved strategies.'); break }
        const lines = strats.map(s => `  ${(s.name as string).padEnd(28)} ${(s.total_backtests as number || 0)} backtests`)
        p.note(lines.join('\n'), `${strats.length} Strategies`)
        break
      }
      case 'deployments': {
        const data = await api('GET', '/deployments')
        const deps = data.deployments as Array<Record<string, unknown>>
        if (deps.length === 0) { p.log.info('No deployments.'); break }
        const lines = deps.map(d => {
          const ret = d.total_return_pct != null ? `${(d.total_return_pct as number).toFixed(1)}%` : 'n/a'
          return `  ${(d.display_name as string).padEnd(28)} ${String(d.status).padEnd(8)} $${d.current_value}  ${ret}`
        })
        p.note(lines.join('\n'), `${deps.length} Deployments`)
        break
      }
      case 'community': {
        const data = await api('GET', '/community/strategies?sort=popularity&limit=10')
        const strats = data.strategies as Array<Record<string, unknown>>
        const lines = strats.map(s => {
          const sharpe = s.avg_sharpe_ratio != null ? (s.avg_sharpe_ratio as number).toFixed(2) : 'n/a'
          return `  ${(s.name as string).padEnd(28)} sharpe: ${sharpe}`
        })
        p.note(lines.join('\n'), 'Community Strategies')
        break
      }
      case 'account': {
        const data = await api('GET', '/account')
        const acct = data.account as Record<string, unknown>
        const apiInfo = acct.api as Record<string, unknown>
        p.note(
          `  Tier:      ${String(acct.tier).toUpperCase()}\n` +
          `  Requests:  ${apiInfo.requests_today}/${apiInfo.rate_limit_per_day} (${apiInfo.requests_remaining} left)\n` +
          `  API Keys:  ${apiInfo.active_keys}/${apiInfo.max_keys}`,
          'Account'
        )
        break
      }
    }
  }
}
