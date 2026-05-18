/**
 * Strategy presets, traits, and metric definitions for the REPL.
 * Mirrors the frontend's strategyIntake.ts + METRIC_CATEGORIES.
 */

import type { Filter } from './repl'

// ─── Traits (human-readable filter presets) ───────────────────────────────────

export interface Trait {
  id: string
  label: string
  detail: string
  filter: Filter
}

export const TRAITS: Trait[] = [
  { id: 'sales-strength', label: 'Sales are stronger', detail: 'Revenue per share is stronger', filter: { metric: 'revenue_per_share', operator: 'percentile_gte', value: 30 } },
  { id: 'profit-growth', label: 'Earnings are stronger', detail: 'Earnings per share are stronger', filter: { metric: 'net_income_per_share', operator: 'percentile_gte', value: 35 } },
  { id: 'profitability', label: 'Uses money efficiently', detail: 'Higher return on equity', filter: { metric: 'return_on_equity', operator: 'percentile_gte', value: 30 } },
  { id: 'capital-efficiency', label: 'Capital earns more', detail: 'Higher return on invested capital', filter: { metric: 'return_on_invested_capital', operator: 'percentile_gte', value: 30 } },
  { id: 'profit-margin', label: 'Keeps more profit', detail: 'Stronger operating margins', filter: { metric: 'operating_profit_margin', operator: 'percentile_gte', value: 35 } },
  { id: 'lower-debt', label: 'Lower debt pressure', detail: 'Relies less on debt', filter: { metric: 'debt_to_equity_ratio', operator: 'percentile_gte', value: 35 } },
  { id: 'cash-generation', label: 'Generates real cash', detail: 'Strong free cash flow', filter: { metric: 'free_cash_flow_per_share', operator: 'percentile_gte', value: 35 } },
  { id: 'reasonable-price', label: 'Reasonable price', detail: 'Not priced too richly', filter: { metric: 'price_to_earnings_ratio', operator: 'percentile_gte', value: 35 } },
  { id: 'pays-shareholders', label: 'Pays shareholders', detail: 'Returns cash through dividends', filter: { metric: 'dividend_yield', operator: 'percentile_gte', value: 40 } },
  { id: 'cash-yield', label: 'Cash looks cheap', detail: 'High FCF relative to price', filter: { metric: 'free_cash_flow_yield', operator: 'percentile_gte', value: 35 } },
  { id: 'book-value', label: 'Book value is sensible', detail: 'Lower price-to-book', filter: { metric: 'price_to_book_ratio', operator: 'percentile_gte', value: 35 } },
  { id: 'bills-covered', label: 'Bills are covered', detail: 'Short-term assets cover bills', filter: { metric: 'current_ratio', operator: 'percentile_gte', value: 35 } },
  { id: 'asset-efficiency', label: 'Assets work harder', detail: 'High revenue vs assets', filter: { metric: 'asset_turnover', operator: 'percentile_gte', value: 35 } },
]

// ─── Strategy Presets ─────────────────────────────────────────────────────────

export interface StrategyPreset {
  name: string
  description: string
  universe: Filter | null
  filters: Filter[]
  traits?: string[]
  topN: number
  momentum: number
  risk: { stop: number | null; trail: number | null; tp: number | null; maxDD: number }
  rebal: string
  recon: string
}

export const PRESETS: StrategyPreset[] = [
  {
    name: 'Momentum Quality',
    description: 'High momentum + profitable large caps with trailing stops',
    universe: null,
    filters: [
      { metric: 'return_on_equity', operator: 'gte', value: 12 },
      { metric: 'gross_profit_margin', operator: 'gte', value: 30 },
      { metric: 'market_cap', operator: 'gte', value: 5_000_000_000 },
    ],
    topN: 10, momentum: 80,
    risk: { stop: 0.15, trail: 0.08, tp: null, maxDD: 0.25 },
    rebal: 'weekly', recon: 'monthly',
  },
  {
    name: 'Classic Value',
    description: 'ROE > 15%, low debt, large caps — balanced momentum',
    universe: null,
    filters: [
      { metric: 'return_on_equity', operator: 'gte', value: 15 },
      { metric: 'debt_to_equity_ratio', operator: 'lte', value: 1.5 },
      { metric: 'market_cap', operator: 'gte', value: 10_000_000_000 },
    ],
    topN: 15, momentum: 50,
    risk: { stop: 0.15, trail: 0.10, tp: null, maxDD: 0.25 },
    rebal: 'monthly', recon: 'quarterly',
  },
  {
    name: 'Dividend Compounder',
    description: 'Sustainable dividends, strong cash flow, trailing protection',
    universe: null,
    filters: [
      { metric: 'dividend_yield', operator: 'gte', value: 2 },
      { metric: 'market_cap', operator: 'gte', value: 5_000_000_000 },
      { metric: 'debt_to_equity_ratio', operator: 'lte', value: 1.5 },
    ],
    topN: 20, momentum: 40,
    risk: { stop: 0.15, trail: 0.08, tp: null, maxDD: 0.25 },
    rebal: 'monthly', recon: 'quarterly',
  },
  {
    name: 'Cash Machine',
    description: 'Pure free cash flow kings with tight risk controls',
    universe: null,
    filters: [
      { metric: 'free_cash_flow_yield', operator: 'gte', value: 5 },
      { metric: 'operating_profit_margin', operator: 'gte', value: 15 },
      { metric: 'market_cap', operator: 'gte', value: 2_000_000_000 },
    ],
    topN: 15, momentum: 50,
    risk: { stop: 0.15, trail: 0.10, tp: null, maxDD: 0.25 },
    rebal: 'monthly', recon: 'monthly',
  },
  {
    name: 'Large Cap Core',
    description: 'Broad mega-cap exposure — low turnover, set and forget',
    universe: null,
    filters: [
      { metric: 'return_on_equity', operator: 'gte', value: 10 },
      { metric: 'market_cap', operator: 'gte', value: 20_000_000_000 },
    ],
    topN: 20, momentum: 50,
    risk: { stop: 0.15, trail: 0.10, tp: null, maxDD: 0.25 },
    rebal: 'monthly', recon: 'quarterly',
  },
]

// ─── Full Metric List (grouped by category) ──────────────────────────────────

export interface MetricDef {
  metric: string
  label: string
  hint: string
  category: string
}

export const ALL_METRICS: MetricDef[] = [
  // VALUATION
  { metric: 'price_to_earnings_ratio', label: 'P/E Ratio', hint: 'lower = cheaper', category: 'Valuation' },
  { metric: 'price_to_book_ratio', label: 'P/B Ratio', hint: 'lower = cheaper', category: 'Valuation' },
  { metric: 'price_to_sales_ratio', label: 'P/S Ratio', hint: 'lower = cheaper', category: 'Valuation' },
  { metric: 'price_to_free_cash_flow_ratio', label: 'P/FCF Ratio', hint: 'lower = cheaper', category: 'Valuation' },
  { metric: 'price_to_earnings_growth_ratio', label: 'PEG Ratio', hint: 'lower = better growth value', category: 'Valuation' },
  { metric: 'enterprise_value_multiple', label: 'EV/EBITDA', hint: 'lower = cheaper', category: 'Valuation' },
  { metric: 'ev_to_sales', label: 'EV/Sales', hint: 'lower = cheaper', category: 'Valuation' },
  { metric: 'ev_to_free_cash_flow', label: 'EV/FCF', hint: 'lower = cheaper', category: 'Valuation' },
  { metric: 'earnings_yield', label: 'Earnings Yield', hint: '% — higher = cheaper', category: 'Valuation' },
  { metric: 'free_cash_flow_yield', label: 'FCF Yield', hint: '% — higher = cheaper', category: 'Valuation' },
  { metric: 'graham_number', label: 'Graham Number', hint: '$ — fair value estimate', category: 'Valuation' },
  // PROFITABILITY
  { metric: 'return_on_equity', label: 'ROE', hint: '% — higher = better', category: 'Profitability' },
  { metric: 'return_on_assets', label: 'ROA', hint: '% — higher = better', category: 'Profitability' },
  { metric: 'return_on_invested_capital', label: 'ROIC', hint: '% — higher = better', category: 'Profitability' },
  { metric: 'gross_profit_margin', label: 'Gross Margin', hint: '% — higher = better', category: 'Profitability' },
  { metric: 'operating_profit_margin', label: 'Operating Margin', hint: '% — higher = better', category: 'Profitability' },
  { metric: 'net_profit_margin', label: 'Net Margin', hint: '% — higher = better', category: 'Profitability' },
  { metric: 'ebitda_margin', label: 'EBITDA Margin', hint: '% — higher = better', category: 'Profitability' },
  // GROWTH
  { metric: 'revenue_per_share', label: 'Revenue/Share', hint: 'higher = growing', category: 'Growth' },
  { metric: 'net_income_per_share', label: 'EPS', hint: 'higher = growing', category: 'Growth' },
  { metric: 'book_value_per_share', label: 'Book Value/Share', hint: 'higher = growing', category: 'Growth' },
  { metric: 'free_cash_flow_per_share', label: 'FCF/Share', hint: 'higher = growing', category: 'Growth' },
  // SAFETY
  { metric: 'current_ratio', label: 'Current Ratio', hint: '>1.5 is healthy', category: 'Safety' },
  { metric: 'quick_ratio', label: 'Quick Ratio', hint: '>1 is healthy', category: 'Safety' },
  { metric: 'debt_to_equity_ratio', label: 'Debt/Equity', hint: 'lower = less leverage', category: 'Safety' },
  { metric: 'debt_to_assets_ratio', label: 'Debt/Assets', hint: '% — lower = safer', category: 'Safety' },
  { metric: 'interest_coverage_ratio', label: 'Interest Coverage', hint: 'higher = safer', category: 'Safety' },
  { metric: 'net_debt_to_ebitda', label: 'Net Debt/EBITDA', hint: 'lower = can repay faster', category: 'Safety' },
  // EFFICIENCY
  { metric: 'asset_turnover', label: 'Asset Turnover', hint: 'higher = more efficient', category: 'Efficiency' },
  { metric: 'inventory_turnover', label: 'Inventory Turnover', hint: 'higher = sells faster', category: 'Efficiency' },
  { metric: 'receivables_turnover', label: 'Receivables Turnover', hint: 'higher = collects faster', category: 'Efficiency' },
  { metric: 'days_sales_outstanding', label: 'Days Sales Outstanding', hint: 'lower = collects faster', category: 'Efficiency' },
  { metric: 'cash_conversion_cycle', label: 'Cash Conversion Cycle', hint: 'lower = faster cycle', category: 'Efficiency' },
  // SIZE
  { metric: 'market_cap', label: 'Market Cap', hint: '$ — company size', category: 'Size' },
  // CASH FLOW
  { metric: 'operating_cash_flow_ratio', label: 'OCF Ratio', hint: 'higher = better', category: 'Cash Flow' },
  { metric: 'free_cash_flow_operating_cash_flow_ratio', label: 'FCF/OCF', hint: 'higher = better', category: 'Cash Flow' },
  { metric: 'dividend_payout_ratio', label: 'Payout Ratio', hint: '% — how much paid out', category: 'Cash Flow' },
  { metric: 'dividend_yield', label: 'Dividend Yield', hint: '% — income', category: 'Cash Flow' },
  { metric: 'capex_to_operating_cash_flow', label: 'Capex/OCF', hint: 'lower = more free cash', category: 'Cash Flow' },
]

export const METRIC_CATEGORIES = [...new Set(ALL_METRICS.map(m => m.category))]
