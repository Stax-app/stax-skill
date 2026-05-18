/**
 * Stax Interactive CLI — powered by @clack/prompts
 *
 * Beautiful guided flows for strategy building.
 * Launch with `stax` (no args).
 */

import * as p from '@clack/prompts'

import { getKey, isLoggedIn, loginFlow } from './auth'
import { TRAITS, PRESETS, ALL_METRICS, METRIC_CATEGORIES } from './presets'

const API = 'https://api.staxlabs.org/api/v1'

// ─── State ────────────────────────────────────────────────────────────────────

export interface Filter { metric: string; operator: string; value: number; value2?: number }
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
  start: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  end: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  capital: 10000,
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

// Metric name lookup for display
function metricLabel(metric: string): string {
  return ALL_METRICS.find(m => m.metric === metric)?.label ?? metric
}

// ─── Build Strategy Object ────────────────────────────────────────────────────

// Helper: convert decimal (0.15) or whole (15) to integer percentage
const toPct = (v: number | null): number => v == null ? 0 : (v < 1 && v > 0 ? Math.round(v * 100) : Math.round(v))

function buildStrategy(): Record<string, unknown> {
  const topN = state.topN
  return {
    schemaVersion: 4,
    fundamentalFilters: state.filters.map(f => ({
      metric: f.metric, operator: f.operator, value: f.value, ...(f.value2 !== undefined && { value2: f.value2 }),
    })),
    ranking: { momentumWeight: state.momentum, fundamentalWeight: 100 - state.momentum, momentumLookback: state.lookback, topN },
    // Full UnifiedStrategy shape — matches frontend exactly
    positionSizing: {
      entrySize: Math.max(1, Math.round(100 / Math.max(topN, 1))),
      maxSize: toPct(state.maxPos),
      minSize: toPct(state.minPos),
      maxPositions: topN,
      fullyInvested: true,
    },
    riskManagement: {
      stopLoss: {
        hardStop: { enabled: state.stop != null, mode: 'fixed', fixedPercent: toPct(state.stop), atrPeriod: 14, atrMultiplier: 2.5 },
        trailing: { enabled: state.trail != null, trailPercent: toPct(state.trail), activationMode: 'profit', activationPercent: 10, activationDays: 30 },
        takeProfitWithTrailing: 'enabled',
      },
      takeProfit: { type: 'percent', value: toPct(state.tp), enabled: state.tp != null },
      maxDrawdown: toPct(state.maxDD),
      exitFailedImmediately: true,
    },
    rebalancing: {
      weighting: state.weight,
      reconstitutionFrequency: state.recon,
      rebalanceFrequency: state.rebal,
      driftThreshold: 5,
      filterEvaluationMode: 'continuous',
      exitFailedImmediately: true,
    },
    tradingCosts: { commission: 0.001, slippage: 0.0005 },
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

// Engine returns all metrics as percentages already (9.3 = 9.3%, 100 = 100%)
function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`
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
  const mode = await p.select({
    message: 'How do you want to add filters?',
    options: [
      { value: 'trait', label: 'Pick a quality', hint: 'human-readable traits like "Uses money efficiently"' },
      { value: 'metric', label: 'Choose a metric', hint: 'all 68 fundamental metrics' },
      { value: 'preset', label: 'Start from a preset', hint: 'Value, Growth, Dividend, Quality...' },
      { value: 'universe', label: 'Set company size', hint: 'Large cap, Mid cap, Small cap' },
    ],
  })
  if (p.isCancel(mode)) return

  if (mode === 'trait') {
    const choice = await p.select({
      message: 'Pick a quality:',
      options: TRAITS.map(t => ({
        value: t.id,
        label: t.label,
        hint: t.detail,
      })),
    })
    if (p.isCancel(choice)) return
    const trait = TRAITS.find(t => t.id === choice)!
    state.filters = state.filters.filter(f => f.metric !== trait.filter.metric)
    state.filters.push({ ...trait.filter })
    p.log.success(`Added: ${trait.label} (${trait.filter.metric} ${trait.filter.operator} ${trait.filter.value})`)
    return
  }

  if (mode === 'preset') {
    const choice = await p.select({
      message: 'Choose a preset:',
      options: PRESETS.map(pr => ({
        value: pr.name,
        label: pr.name,
        hint: pr.description,
      })),
    })
    if (p.isCancel(choice)) return
    const preset = PRESETS.find(pr => pr.name === choice)!

    // Apply preset to state
    state.filters = preset.filters.map(f => ({ ...f }))
    if (preset.universe) state.filters.unshift(preset.universe)
    state.topN = preset.topN
    state.momentum = preset.momentum
    state.stop = preset.risk.stop
    state.trail = preset.risk.trail
    state.tp = preset.risk.tp
    state.maxDD = preset.risk.maxDD
    state.rebal = preset.rebal
    state.recon = preset.recon

    p.log.success(`Loaded "${preset.name}" — ${state.filters.length} filters, top ${state.topN}`)
    showStatus()
    return
  }

  if (mode === 'universe') {
    const size = await p.select({
      message: 'Company size:',
      options: [
        { value: 'large', label: 'Large Cap ($10B+)' },
        { value: 'mid', label: 'Mid Cap ($2B–$10B)' },
        { value: 'small', label: 'Small Cap ($300M–$2B)' },
        { value: 'any', label: 'Any size' },
      ],
    })
    if (p.isCancel(size)) return
    // Remove existing market_cap filter
    state.filters = state.filters.filter(f => f.metric !== 'market_cap')
    if (size === 'large') state.filters.push({ metric: 'market_cap', operator: 'gte', value: 10_000_000_000 })
    else if (size === 'mid') state.filters.push({ metric: 'market_cap', operator: 'between', value: 2_000_000_000, value2: 10_000_000_000 })
    else if (size === 'small') state.filters.push({ metric: 'market_cap', operator: 'between', value: 300_000_000, value2: 2_000_000_000 })
    p.log.success(size === 'any' ? 'Universe: any size' : `Universe: ${size} cap`)
    return
  }

  // Raw metric picker — grouped by category
  const category = await p.select({
    message: 'Category:',
    options: METRIC_CATEGORIES.map(c => ({ value: c, label: c })),
  })
  if (p.isCancel(category)) return

  const metricsInCat = ALL_METRICS.filter(m => m.category === category)
  const metricChoice = await p.select({
    message: 'Metric:',
    options: metricsInCat.map(m => ({ value: m.metric, label: m.label, hint: m.hint })),
  })
  if (p.isCancel(metricChoice)) return

  const op = await p.select({
    message: 'Operator:',
    options: [
      { value: 'gte', label: '≥  greater than or equal' },
      { value: 'gt', label: '>  greater than' },
      { value: 'lte', label: '≤  less than or equal' },
      { value: 'lt', label: '<  less than' },
      { value: 'between', label: '↔  between (range)' },
      { value: 'percentile_gte', label: '⬆ top percentile', hint: 'e.g. 30 = top 30%' },
    ],
  })
  if (p.isCancel(op)) return

  const val = await p.text({
    message: op === 'between' ? 'Min value:' : op === 'percentile_gte' ? 'Percentile (1-99):' : 'Value:',
    validate: (v) => isNaN(Number(v)) ? 'Must be a number' : undefined,
  })
  if (p.isCancel(val)) return

  let val2: string | symbol | undefined
  if (op === 'between') {
    val2 = await p.text({ message: 'Max value:', validate: (v) => isNaN(Number(v)) ? 'Must be a number' : undefined })
    if (p.isCancel(val2)) return
  }

  state.filters = state.filters.filter(f => f.metric !== metricChoice)
  state.filters.push({
    metric: metricChoice as string,
    operator: op as string,
    value: Number(val),
    ...(val2 !== undefined && { value2: Number(val2) }),
  })

  const label = ALL_METRICS.find(m => m.metric === metricChoice)?.label ?? metricChoice
  p.log.success(`Added: ${label} ${op} ${val}${val2 ? `..${val2}` : ''}`)
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
    const tradeList = (result.trades as Array<Record<string, unknown>>) ?? []
    const tradeCount = tradeList.length

    spin.stop(`Done in ${((Number(meta.executionTimeMs) || 0) / 1000).toFixed(1)}s — ${meta.symbolsScreened} symbols screened`)

    state.prevRun = state.lastRun
    state.lastRun = { metrics, trades: tradeCount, time: Number(meta.executionTimeMs) || 0 }

    // Show metrics
    p.note(
      fmtMetrics(metrics) + `\n  ${'Trades'.padEnd(18)} ${tradeCount}`,
      'Results'
    )

    // Show recent trades
    if (tradeList.length > 0) {
      const displayTrades = tradeList.slice(0, 10)
      const tradeLines = displayTrades.map(t => {
        const sym = (t.symbol as string ?? '?').padEnd(6)
        const entry = t.entryDate ? new Date(t.entryDate as string | number).toISOString().slice(0, 10) : '?'
        const exit = t.exitDate ? new Date(t.exitDate as string | number).toISOString().slice(0, 10) : 'open'
        const pnl = t.pnl != null ? `$${Number(t.pnl).toFixed(0)}` : '?'
        const reason = t.exitReason as string ?? ''
        return `  ${sym} ${entry} → ${exit}  ${pnl.padStart(8)}  ${reason}`
      })
      if (tradeList.length > 10) tradeLines.push(`  ... and ${tradeList.length - 10} more`)
      p.note(tradeLines.join('\n'), `Trades (${tradeCount})`)
    }

    // Quick next action
    if (state.prevRun) {
      p.log.info('Tip: "compare" to see changes, "tweak" to adjust a filter')
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
      const name = metricLabel(f.metric)
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
  const name = metricLabel(choice as string)
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
        const name = metricLabel(f.metric)
        return `  ${name} ${f.operator} ${f.value}${f.value2 !== undefined ? `..${f.value2}` : ''}`
      }).join('\n')
    : '  (none)'

  p.note(
    `Filters:\n${filtersText}\n\n` +
    `  Holdings: top ${state.topN} | Momentum: ${state.momentum}%\n` +
    `  Stop: ${state.stop != null ? (state.stop * 100).toFixed(0) + '%' : 'off'} | Trail: ${state.trail != null ? (state.trail * 100).toFixed(0) + '%' : 'off'} | TP: ${state.tp != null ? (state.tp * 100).toFixed(0) + '%' : 'off'} | MaxDD: ${state.maxDD != null ? (state.maxDD * 100).toFixed(0) + '%' : '?'}\n` +
    `  Rebalance: ${state.rebal} | Recon: ${state.recon}\n` +
    `  Period: ${state.start} → ${state.end} | $${state.capital.toLocaleString()}`,
    'Current Strategy'
  )
}

// ─── Strategy/Community/Deployment Flows ──────────────────────────────────────

function fmtStrategyHint(s: Record<string, unknown>): string {
  const parts: string[] = []
  // Author (for community)
  const author = s.users as Record<string, unknown> | null
  if (author?.username) parts.push(`@${author.username}`)
  // Stats
  const sharpe = s.avg_sharpe_ratio != null ? `sharpe: ${(s.avg_sharpe_ratio as number).toFixed(2)}` : null
  const ret = s.avg_total_return != null ? `ret: ${(s.avg_total_return as number).toFixed(1)}%` : null
  const bt = s.total_backtests as number || 0
  if (sharpe) parts.push(sharpe)
  if (ret) parts.push(ret)
  if (bt > 0) parts.push(`${bt} bt`)
  // Date
  const date = s.updated_at ?? s.created_at
  if (date) parts.push(new Date(date as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
  return parts.join(' · ') || 'no data'
}

/** Extract a risk parameter and normalize to decimal (0.20 = 20%).
 *  Handles all legacy formats:
 *    - 0.20          → 0.20 (already decimal)
 *    - 20            → 0.20 (whole number = percentage)
 *    - {type:"percentage", value:20}  → 0.20
 *    - {type:"percentage", value:0.2} → 0.20
 *    - null/undefined → null (disabled)
 */
function riskVal(v: unknown): number | null {
  if (v === null || v === undefined) return null
  let num: number
  if (typeof v === 'number') {
    num = v
  } else if (typeof v === 'object' && v !== null && 'value' in v) {
    num = Number((v as Record<string, unknown>).value)
  } else {
    return null
  }
  // Normalize: if > 1, it's a whole-number percentage (20 = 20% → 0.20)
  // Engine expects decimals where stop=0.20 means 20%
  if (num > 1) return num / 100
  return num
}

function loadStrategyIntoState(params: Record<string, unknown>) {
  const rawFilters = (params.fundamentalFilters as Array<Record<string, unknown>>) ?? []
  const supported: Filter[] = []

  for (const f of rawFilters) {
    supported.push({ metric: f.metric as string, operator: f.operator as string, value: f.value as number, value2: f.value2 as number | undefined })
  }
  state.filters = supported

  const ranking = params.ranking as Record<string, unknown> ?? {}
  state.topN = (ranking.topN as number) ?? 10
  state.momentum = (ranking.momentumWeight as number) ?? 50
  state.lookback = (ranking.momentumLookback as number) ?? 6
  const risk = params.riskManagement as Record<string, unknown> ?? {}
  state.stop = riskVal(risk.hardStopLoss)
  state.trail = riskVal(risk.trailingStopLoss)
  state.tp = riskVal(risk.takeProfit)
  state.maxDD = riskVal(risk.maxDrawdown) ?? 0.35
  const rebal = params.rebalancing as Record<string, unknown> ?? {}
  state.rebal = (rebal.frequency as string) ?? 'monthly'
  state.recon = (rebal.reconstitutionFrequency as string) ?? 'quarterly'
  state.weight = (rebal.weightingMethod as string) ?? 'equal'
  const pos = params.positionSizing as Record<string, unknown> ?? {}
  state.maxPos = riskVal(pos.maxPositionSize) ?? 0.20
  state.minPos = riskVal(pos.minPositionSize) ?? 0.02
}

async function strategiesFlow() {
  const spin = p.spinner()
  spin.start('Loading strategies...')
  const data = await api('GET', '/strategies?limit=20')
  const strats = data.strategies as Array<Record<string, unknown>>
  spin.stop(`${strats.length} strategies`)

  if (strats.length === 0) { p.log.info('No saved strategies. Build one and save it!'); return }

  const choice = await p.select({
    message: 'Select a strategy:',
    options: [
      ...strats.map(s => ({
        value: s.id as string,
        label: s.name as string,
        hint: fmtStrategyHint(s),
      })),
      { value: '__back', label: '← Back' },
    ],
  })
  if (p.isCancel(choice) || choice === '__back') return

  const action = await p.select({
    message: 'What to do with it?',
    options: [
      { value: 'load', label: 'Load into builder', hint: 'replace current strategy' },
      { value: 'backtest', label: 'Load and backtest', hint: 'load + run immediately' },
      { value: 'deploy', label: 'Load and deploy', hint: 'paper trade it' },
      { value: 'delete', label: 'Delete', hint: 'permanently remove' },
      { value: '__back', label: '← Back' },
    ],
  })
  if (p.isCancel(action) || action === '__back') return

  if (action === 'delete') {
    const confirm = await p.confirm({ message: 'Are you sure? This cannot be undone.' })
    if (p.isCancel(confirm) || !confirm) return
    await api('DELETE', `/strategies/${choice}`)
    p.log.success('Deleted.')
    return
  }

  // Load the strategy
  const loaded = await api('GET', `/strategies/${choice}`)
  const strat = loaded.strategy as Record<string, unknown>
  const params = strat.parameters as Record<string, unknown>
  loadStrategyIntoState(params)
  state.savedId = choice as string
  p.log.success(`Loaded: ${strat.name}`)
  showStatus()

  if (action === 'backtest') await runBacktest()
  if (action === 'deploy') await deployFlow()
}

async function communityFlow() {
  const sortChoice = await p.select({
    message: 'Sort by:',
    options: [
      { value: 'popularity', label: 'Most Popular' },
      { value: 'sharpe', label: 'Best Sharpe Ratio' },
      { value: 'returns', label: 'Highest Returns' },
      { value: 'newest', label: 'Newest' },
      { value: 'backtests', label: 'Most Backtested' },
    ],
  })
  if (p.isCancel(sortChoice)) return

  const spin = p.spinner()
  spin.start('Loading community strategies...')
  const data = await api('GET', `/community/strategies?sort=${sortChoice}&limit=15`)
  const strats = data.strategies as Array<Record<string, unknown>>
  spin.stop(`${strats.length} strategies`)

  if (strats.length === 0) { p.log.info('No public strategies yet.'); return }

  const choice = await p.select({
    message: 'Select a strategy:',
    options: [
      ...strats.map(s => ({
        value: s.id as string,
        label: s.name as string,
        hint: fmtStrategyHint(s),
      })),
      { value: '__back', label: '← Back' },
    ],
  })
  if (p.isCancel(choice) || choice === '__back') return

  const action = await p.select({
    message: 'What to do?',
    options: [
      { value: 'fork', label: 'Fork to my account', hint: 'copy + load into builder' },
      { value: 'view', label: 'View details' },
      { value: '__back', label: '← Back' },
    ],
  })
  if (p.isCancel(action) || action === '__back') return

  if (action === 'view') {
    const detail = await api('GET', `/community/strategies/${choice}`)
    const s = detail.strategy as Record<string, unknown>
    const params = s.parameters as Record<string, unknown>
    const filters = (params?.fundamentalFilters as Array<Record<string, unknown>>) ?? []
    const ranking = params?.ranking as Record<string, unknown> ?? {}
    p.note(
      `  ${s.name}\n` +
      `  ${s.description || '(no description)'}\n\n` +
      `  Filters: ${filters.map(f => `${f.metric} ${f.operator} ${f.value}`).join(', ') || 'none'}\n` +
      `  TopN: ${ranking.topN ?? '?'} | Momentum: ${ranking.momentumWeight ?? '?'}%\n` +
      (s.stats ? `  Backtests: ${(s.stats as Record<string, unknown>).total_backtests}` : ''),
      'Strategy Details'
    )
    const doFork = await p.confirm({ message: 'Fork this strategy?' })
    if (p.isCancel(doFork) || !doFork) return
    // fall through to fork
  }

  // Fork
  const spin2 = p.spinner()
  spin2.start('Forking...')
  const forked = await api('POST', `/community/strategies/${choice}/fork`)
  const fStrat = forked.strategy as Record<string, unknown>
  spin2.stop(`Forked: ${fStrat.name}`)

  // Load it
  const loaded = await api('GET', `/strategies/${fStrat.id}`)
  const strat = loaded.strategy as Record<string, unknown>
  loadStrategyIntoState(strat.parameters as Record<string, unknown>)
  state.savedId = fStrat.id as string
  p.log.success('Loaded into builder. Tweak and backtest!')
  showStatus()
}

async function deploymentsFlow() {
  const spin = p.spinner()
  spin.start('Loading deployments...')
  const data = await api('GET', '/deployments')
  const deps = data.deployments as Array<Record<string, unknown>>
  spin.stop(`${deps.length} deployments`)

  if (deps.length === 0) { p.log.info('No deployments. Build a strategy and deploy it!'); return }

  const choice = await p.select({
    message: 'Select a deployment:',
    options: [
      ...deps.map(d => {
        const ret = d.total_return_pct != null ? `${(d.total_return_pct as number).toFixed(1)}%` : 'n/a'
        return {
          value: d.id as string,
          label: d.display_name as string,
          hint: `${d.status} · $${d.current_value} · ${ret}`,
        }
      }),
      { value: '__back', label: '← Back' },
    ],
  })
  if (p.isCancel(choice) || choice === '__back') return

  const dep = deps.find(d => d.id === choice)!
  const actions: Array<{ value: string; label: string; hint?: string }> = [
    { value: 'view', label: 'View details', hint: 'positions, trades, performance' },
  ]
  if (dep.status === 'active') {
    actions.push({ value: 'pause', label: 'Pause' })
    actions.push({ value: 'stop', label: 'Stop', hint: 'permanently stop' })
  } else if (dep.status === 'paused') {
    actions.push({ value: 'resume', label: 'Resume' })
    actions.push({ value: 'stop', label: 'Stop', hint: 'permanently stop' })
  }
  actions.push({ value: '__back', label: '← Back' })

  const action = await p.select({ message: 'What to do?', options: actions })
  if (p.isCancel(action) || action === '__back') return

  if (action === 'view') {
    const detail = await api('GET', `/deployments/${choice}`)
    const d = detail.deployment as Record<string, unknown>
    const positions = detail.positions as Array<Record<string, unknown>> ?? []
    const trades = detail.recent_trades as Array<Record<string, unknown>> ?? []
    const perf = d.performance as Record<string, unknown> ?? {}

    let text = `  ${d.display_name} (${d.status})\n` +
      `  Capital: $${d.initial_capital} → $${d.current_value}\n` +
      `  Return: ${perf.total_return_pct != null ? `${(perf.total_return_pct as number).toFixed(1)}%` : 'n/a'}\n` +
      `  Sharpe: ${perf.sharpe_ratio ?? 'n/a'} | Drawdown: ${perf.current_drawdown_pct != null ? `${(perf.current_drawdown_pct as number).toFixed(1)}%` : 'n/a'}\n`

    if (positions.length > 0) {
      text += `\n  Positions (${positions.length}):\n`
      for (const pos of positions.slice(0, 10)) {
        text += `    ${(pos.symbol as string).padEnd(8)} ${pos.shares ?? '?'} shares\n`
      }
    }
    if (trades.length > 0) {
      text += `\n  Recent Trades (${trades.length}):\n`
      for (const t of trades.slice(0, 5)) {
        text += `    ${(t.symbol as string).padEnd(8)} ${t.side ?? '?'} ${t.shares ?? '?'} @ $${t.price ?? '?'}\n`
      }
    }
    p.note(text, 'Deployment')
    return
  }

  // stop/pause/resume
  await api('POST', `/deployments/${choice}/${action}`)
  p.log.success(`${String(action).charAt(0).toUpperCase() + String(action).slice(1)}d.`)
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
      case 'strategies': await strategiesFlow(); break
      case 'deployments': await deploymentsFlow(); break
      case 'community': await communityFlow(); break
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
