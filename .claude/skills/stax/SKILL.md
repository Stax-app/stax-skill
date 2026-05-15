---
name: stax
version: 1.0.0
description: |
  Stax Labs backtesting and strategy management API. Build investment strategies,
  backtest them against historical data, and screen the stock universe — all from
  Claude Code. Use when the user asks to "build a strategy", "backtest", "screen stocks",
  "test a value strategy", or anything related to quantitative investing.
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---

# Stax Labs API

Build, backtest, and screen investment strategies programmatically through the Stax Labs API.

## Setup

The user needs an API key. If they don't have one configured, ask them to:
1. Get a key from their Stax Labs account (Pro tier or above)
2. Set it: `export STAX_API_KEY=sk_...`

## API Base

```
https://api.staxlabs.org/api/v1
```

All requests require: `Authorization: Bearer $STAX_API_KEY`

## How to Call the API

Use `curl` via the Bash tool:

```bash
curl -s -X POST https://api.staxlabs.org/api/v1/backtest \
  -H "Authorization: Bearer $STAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{...strategy JSON...}' | jq .
```

## Endpoints

### Core
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/backtest` | Run a full backtest |
| `POST` | `/api/v1/screen` | Screen universe against filters |
| `GET` | `/api/v1/health` | Health check (no auth) |

### Strategies
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/strategies` | List your saved strategies |
| `POST` | `/api/v1/strategies` | Save a new strategy |
| `GET` | `/api/v1/strategies/:id` | Get a strategy by ID |
| `PUT` | `/api/v1/strategies/:id` | Update a strategy |
| `DELETE` | `/api/v1/strategies/:id` | Delete a strategy |

### Account
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/account` | Your tier, rate limits, usage |
| `GET` | `/api/v1/account/keys` | List your API keys |
| `POST` | `/api/v1/account/keys` | Create a new API key |
| `DELETE` | `/api/v1/account/keys/:id` | Revoke an API key |

### Community
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/community/strategies` | Browse public strategies |
| `GET` | `/api/v1/community/strategies/:id` | Get a public strategy |
| `POST` | `/api/v1/community/strategies/:id/fork` | Fork to your account |

---

## Strategy JSON Schema

Every backtest requires a strategy object. Here's the full schema:

```json
{
  "strategy": {
    "name": "My Strategy",
    "schemaVersion": 4,

    "fundamentalFilters": [
      { "metric": "return_on_equity", "operator": "gte", "value": 15 },
      { "metric": "debt_to_equity_ratio", "operator": "lte", "value": 1.0 },
      { "metric": "market_cap", "operator": "gte", "value": 1000000000 }
    ],

    "ranking": {
      "momentumWeight": 50,
      "fundamentalWeight": 50,
      "momentumLookback": 6,
      "topN": 20
    },

    "positionSizing": {
      "maxPositionSize": 0.10,
      "minPositionSize": 0.01
    },

    "riskManagement": {
      "hardStopLoss": 0.20,
      "trailingStopLoss": 0.15,
      "takeProfit": 0.50,
      "maxDrawdown": 0.30,
      "exitFailedImmediately": true
    },

    "rebalancing": {
      "frequency": "monthly",
      "weightingMethod": "equal",
      "reconstitutionFrequency": "quarterly"
    },

    "tradingCosts": {
      "commission": { "type": "per_share", "value": 0.005 },
      "slippage": { "type": "percentage", "value": 0.001 }
    }
  },
  "startDate": "2022-01-01",
  "endDate": "2024-12-31",
  "initialCapital": 100000
}
```

---

## Available Metrics (68 Total)

### VALUATION (15 metrics)
| Metric | Description | Direction |
|--------|-------------|-----------|
| `price_to_earnings_ratio` | P/E — price per $1 of profit | Lower is better |
| `price_to_book_ratio` | P/B — price vs book value | Lower is better |
| `price_to_sales_ratio` | P/S — price vs revenue | Lower is better |
| `price_to_free_cash_flow_ratio` | P/FCF — price vs free cash | Lower is better |
| `price_to_operating_cash_flow_ratio` | P/OCF — price vs operating cash | Lower is better |
| `price_to_earnings_growth_ratio` | PEG — P/E adjusted for growth | Lower is better |
| `enterprise_value_multiple` | EV/EBITDA multiple | Lower is better |
| `price_to_fair_value` | Price vs estimated fair value | Lower is better |
| `ev_to_sales` | Enterprise value / revenue | Lower is better |
| `ev_to_ebitda` | Enterprise value / EBITDA | Lower is better |
| `ev_to_free_cash_flow` | Enterprise value / FCF | Lower is better |
| `ev_to_operating_cash_flow` | Enterprise value / OCF | Lower is better |
| `earnings_yield` | Earnings / price (%) | Higher is better |
| `free_cash_flow_yield` | FCF / price (%) | Higher is better |
| `graham_number` | Ben Graham's fair price formula | Higher is better |

### PROFITABILITY (11 metrics)
| Metric | Description | Direction |
|--------|-------------|-----------|
| `gross_profit_margin` | Revenue kept after COGS (%) | Higher is better |
| `operating_profit_margin` | Operating profit / revenue (%) | Higher is better |
| `net_profit_margin` | Net income / revenue (%) | Higher is better |
| `ebit_margin` | EBIT / revenue (%) | Higher is better |
| `ebitda_margin` | EBITDA / revenue (%) | Higher is better |
| `return_on_equity` | ROE — profit / shareholder equity (%) | Higher is better |
| `return_on_assets` | ROA — profit / total assets (%) | Higher is better |
| `return_on_invested_capital` | ROIC — return on all capital (%) | Higher is better |
| `return_on_capital_employed` | ROCE — return on employed capital (%) | Higher is better |
| `return_on_tangible_assets` | ROTA — return on tangible assets (%) | Higher is better |
| `operating_return_on_assets` | Operating income / assets (%) | Higher is better |

### QUALITY (5 metrics — 2 blocked in backtests)
| Metric | Description | Direction |
|--------|-------------|-----------|
| `income_quality` | Cash flow / reported earnings | Higher is better |
| `intangibles_to_total_assets` | Intangible assets % | Lower is better |
| `capex_to_revenue` | Capital spending / revenue | Lower is better |
| `research_development_to_revenue` | R&D spending / revenue | Higher is better |
| `stock_based_compensation_to_revenue` | SBC / revenue | Lower is better |

> `piotroski_score` and `altman_z_score` are blocked in backtests (lookahead bias).

### GROWTH (5 metrics)
| Metric | Description | Direction |
|--------|-------------|-----------|
| `revenue_per_share` | Revenue / shares | Higher is better |
| `net_income_per_share` | EPS | Higher is better |
| `book_value_per_share` | Book value / shares | Higher is better |
| `free_cash_flow_per_share` | FCF / shares | Higher is better |
| `operating_cash_flow_per_share` | OCF / shares | Higher is better |

### SAFETY (10 metrics)
| Metric | Description | Direction |
|--------|-------------|-----------|
| `current_ratio` | Current assets / current liabilities | Higher is better |
| `quick_ratio` | Liquid assets / current liabilities | Higher is better |
| `cash_ratio` | Cash / current liabilities | Higher is better |
| `debt_to_equity_ratio` | Total debt / equity | Lower is better |
| `debt_to_assets_ratio` | Debt / total assets (%) | Lower is better |
| `debt_to_capital_ratio` | Debt / total capital (%) | Lower is better |
| `interest_coverage_ratio` | EBIT / interest expense | Higher is better |
| `debt_service_coverage_ratio` | Income / debt payments | Higher is better |
| `solvency_ratio` | Long-term financial health | Higher is better |
| `net_debt_to_ebitda` | Years of earnings to pay debt | Lower is better |

### EFFICIENCY (11 metrics)
| Metric | Description | Direction |
|--------|-------------|-----------|
| `asset_turnover` | Revenue / total assets | Higher is better |
| `inventory_turnover` | COGS / inventory | Higher is better |
| `receivables_turnover` | Revenue / receivables | Higher is better |
| `payables_turnover` | COGS / payables | Higher is better |
| `fixed_asset_turnover` | Revenue / fixed assets | Higher is better |
| `working_capital_turnover_ratio` | Revenue / working capital | Higher is better |
| `days_sales_outstanding` | Days to collect payment | Lower is better |
| `days_payables_outstanding` | Days to pay suppliers | Higher is better |
| `days_inventory_outstanding` | Days inventory sits | Lower is better |
| `cash_conversion_cycle` | Full cash cycle (days) | Lower is better |
| `operating_cycle` | Inventory + collection (days) | Lower is better |

### SIZE (1 metric)
| Metric | Description | Direction |
|--------|-------------|-----------|
| `market_cap` | Total market capitalization ($) | Context-dependent |

### CASH FLOW (10 metrics)
| Metric | Description | Direction |
|--------|-------------|-----------|
| `operating_cash_flow_ratio` | OCF / current liabilities | Higher is better |
| `operating_cash_flow_sales_ratio` | OCF / revenue | Higher is better |
| `free_cash_flow_operating_cash_flow_ratio` | FCF / OCF | Higher is better |
| `capital_expenditure_coverage_ratio` | OCF / capex | Higher is better |
| `dividend_payout_ratio` | Dividends / earnings (%) | Context-dependent |
| `dividend_yield` | Annual dividend / price (%) | Higher is better |
| `free_cash_flow_to_equity` | Cash to shareholders ($) | Higher is better |
| `free_cash_flow_to_firm` | Cash to all investors ($) | Higher is better |
| `capex_to_operating_cash_flow` | Capex / OCF | Lower is better |
| `capex_to_depreciation` | Capex / depreciation | Context-dependent |

---

## Filter Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `gt` | Greater than | `{ "metric": "return_on_equity", "operator": "gt", "value": 10 }` |
| `gte` | Greater than or equal | P/E >= 5 |
| `lt` | Less than | D/E < 1.0 |
| `lte` | Less than or equal | P/E <= 20 |
| `eq` | Equals (±0.001) | Current ratio = 2.0 |
| `between` | Inclusive range | `{ "operator": "between", "value": 10, "value2": 25 }` |

**Value rules:**
- **Percentage metrics** (margins, ROE, yields): Enter whole numbers. `15` = 15%.
- **Dollar metrics** (market_cap, FCFE, FCFF): Enter raw amount. `1000000000` = $1B.
- **Ratio metrics** (P/E, D/E, current ratio): Enter the ratio. `20` = 20x.

---

## Configuration Reference

### Ranking
```json
"ranking": {
  "momentumWeight": 50,        // 0-100, must sum to 100 with fundamentalWeight
  "fundamentalWeight": 50,     // 0-100
  "momentumLookback": 6,       // Months (1-24)
  "topN": 20                   // Stocks to hold (1+)
}
```

### Position Sizing
```json
"positionSizing": {
  "maxPositionSize": 0.10,     // Max 10% per position (0.01-1.0)
  "minPositionSize": 0.01      // Close below 1% (0.001-1.0)
}
```

### Risk Management
```json
"riskManagement": {
  "hardStopLoss": 0.20,        // Exit at 20% loss (0.01-0.50), null to disable
  "trailingStopLoss": 0.15,    // Trail 15% below high (0.01-0.50), null to disable
  "takeProfit": 0.50,          // Take profit at 50% gain (0.01-4.0), null to disable
  "maxDrawdown": 0.30,         // Portfolio circuit breaker (0.05-0.50)
  "exitFailedImmediately": true // Exit stocks failing screen immediately
}
```

### Rebalancing
```json
"rebalancing": {
  "frequency": "monthly",                    // daily | weekly | monthly
  "weightingMethod": "equal",                // equal | market-cap
  "reconstitutionFrequency": "quarterly"     // monthly | quarterly | semi-annual | annual
}
```

### Trading Costs
```json
"tradingCosts": {
  "commission": { "type": "per_share", "value": 0.005 },  // $0.005/share
  "slippage": { "type": "percentage", "value": 0.001 }    // 0.1%
}
```

---

## Example Strategies

### 1. Classic Value (Buffett-style)
```json
{
  "strategy": {
    "name": "Classic Value",
    "schemaVersion": 4,
    "fundamentalFilters": [
      { "metric": "price_to_earnings_ratio", "operator": "between", "value": 5, "value2": 15 },
      { "metric": "return_on_equity", "operator": "gte", "value": 15 },
      { "metric": "debt_to_equity_ratio", "operator": "lte", "value": 0.5 },
      { "metric": "current_ratio", "operator": "gte", "value": 1.5 }
    ],
    "ranking": { "momentumWeight": 30, "fundamentalWeight": 70, "momentumLookback": 6, "topN": 15 },
    "positionSizing": { "maxPositionSize": 0.10, "minPositionSize": 0.01 },
    "riskManagement": { "hardStopLoss": 0.25, "maxDrawdown": 0.35, "exitFailedImmediately": true },
    "rebalancing": { "frequency": "monthly", "weightingMethod": "equal", "reconstitutionFrequency": "quarterly" },
    "tradingCosts": { "commission": { "type": "per_share", "value": 0.005 }, "slippage": { "type": "percentage", "value": 0.001 } }
  },
  "startDate": "2020-01-01", "endDate": "2024-12-31", "initialCapital": 100000
}
```

### 2. Growth Momentum
```json
{
  "strategy": {
    "name": "Growth Momentum",
    "schemaVersion": 4,
    "fundamentalFilters": [
      { "metric": "revenue_per_share", "operator": "gte", "value": 5 },
      { "metric": "net_income_per_share", "operator": "gte", "value": 1 },
      { "metric": "gross_profit_margin", "operator": "gte", "value": 30 },
      { "metric": "return_on_invested_capital", "operator": "gte", "value": 12 }
    ],
    "ranking": { "momentumWeight": 70, "fundamentalWeight": 30, "momentumLookback": 12, "topN": 10 },
    "positionSizing": { "maxPositionSize": 0.15, "minPositionSize": 0.02 },
    "riskManagement": { "hardStopLoss": 0.20, "trailingStopLoss": 0.12, "takeProfit": 0.60, "maxDrawdown": 0.25, "exitFailedImmediately": true },
    "rebalancing": { "frequency": "weekly", "weightingMethod": "equal", "reconstitutionFrequency": "monthly" },
    "tradingCosts": { "commission": { "type": "per_share", "value": 0.005 }, "slippage": { "type": "percentage", "value": 0.001 } }
  },
  "startDate": "2021-01-01", "endDate": "2024-12-31", "initialCapital": 100000
}
```

### 3. Quality Dividend
```json
{
  "strategy": {
    "name": "Quality Dividend",
    "schemaVersion": 4,
    "fundamentalFilters": [
      { "metric": "dividend_yield", "operator": "gte", "value": 2 },
      { "metric": "dividend_payout_ratio", "operator": "between", "value": 20, "value2": 70 },
      { "metric": "income_quality", "operator": "gte", "value": 1.0 },
      { "metric": "debt_to_equity_ratio", "operator": "lte", "value": 1.0 },
      { "metric": "market_cap", "operator": "gte", "value": 5000000000 }
    ],
    "ranking": { "momentumWeight": 40, "fundamentalWeight": 60, "momentumLookback": 6, "topN": 25 },
    "positionSizing": { "maxPositionSize": 0.08, "minPositionSize": 0.01 },
    "riskManagement": { "hardStopLoss": 0.30, "maxDrawdown": 0.40, "exitFailedImmediately": true },
    "rebalancing": { "frequency": "monthly", "weightingMethod": "equal", "reconstitutionFrequency": "quarterly" },
    "tradingCosts": { "commission": { "type": "per_share", "value": 0.005 }, "slippage": { "type": "percentage", "value": 0.001 } }
  },
  "startDate": "2019-01-01", "endDate": "2024-12-31", "initialCapital": 100000
}
```

### 4. Small-Cap Deep Value
```json
{
  "strategy": {
    "name": "Small-Cap Deep Value",
    "schemaVersion": 4,
    "fundamentalFilters": [
      { "metric": "market_cap", "operator": "between", "value": 300000000, "value2": 2000000000 },
      { "metric": "price_to_book_ratio", "operator": "lte", "value": 1.5 },
      { "metric": "price_to_earnings_ratio", "operator": "lte", "value": 12 },
      { "metric": "current_ratio", "operator": "gte", "value": 2.0 },
      { "metric": "return_on_equity", "operator": "gte", "value": 10 }
    ],
    "ranking": { "momentumWeight": 40, "fundamentalWeight": 60, "momentumLookback": 3, "topN": 20 },
    "positionSizing": { "maxPositionSize": 0.08, "minPositionSize": 0.01 },
    "riskManagement": { "hardStopLoss": 0.25, "trailingStopLoss": 0.15, "maxDrawdown": 0.35, "exitFailedImmediately": true },
    "rebalancing": { "frequency": "monthly", "weightingMethod": "equal", "reconstitutionFrequency": "monthly" },
    "tradingCosts": { "commission": { "type": "per_share", "value": 0.005 }, "slippage": { "type": "percentage", "value": 0.002 } }
  },
  "startDate": "2020-01-01", "endDate": "2024-12-31", "initialCapital": 100000
}
```

### 5. Defensive Quality (Low Drawdown)
```json
{
  "strategy": {
    "name": "Defensive Quality",
    "schemaVersion": 4,
    "fundamentalFilters": [
      { "metric": "market_cap", "operator": "gte", "value": 10000000000 },
      { "metric": "gross_profit_margin", "operator": "gte", "value": 40 },
      { "metric": "net_profit_margin", "operator": "gte", "value": 10 },
      { "metric": "debt_to_equity_ratio", "operator": "lte", "value": 0.5 },
      { "metric": "income_quality", "operator": "gte", "value": 1.0 },
      { "metric": "interest_coverage_ratio", "operator": "gte", "value": 5 }
    ],
    "ranking": { "momentumWeight": 30, "fundamentalWeight": 70, "momentumLookback": 6, "topN": 30 },
    "positionSizing": { "maxPositionSize": 0.06, "minPositionSize": 0.01 },
    "riskManagement": { "hardStopLoss": 0.15, "trailingStopLoss": 0.10, "takeProfit": 0.30, "maxDrawdown": 0.20, "exitFailedImmediately": true },
    "rebalancing": { "frequency": "monthly", "weightingMethod": "equal", "reconstitutionFrequency": "quarterly" },
    "tradingCosts": { "commission": { "type": "per_share", "value": 0.005 }, "slippage": { "type": "percentage", "value": 0.001 } }
  },
  "startDate": "2019-01-01", "endDate": "2024-12-31", "initialCapital": 100000
}
```

---

## Interpreting Results

### Key Metrics Benchmarks

| Metric | Poor | Average | Good | Excellent |
|--------|------|---------|------|-----------|
| **Sharpe Ratio** | < 0.5 | 0.5-1.0 | 1.0-2.0 | > 2.0 |
| **Total Return** (annual) | < 5% | 5-12% | 12-25% | > 25% |
| **Max Drawdown** | > 40% | 25-40% | 15-25% | < 15% |
| **Win Rate** | < 40% | 40-50% | 50-60% | > 60% |
| **Profit Factor** | < 1.0 | 1.0-1.5 | 1.5-2.5 | > 2.5 |
| **Sortino Ratio** | < 0.5 | 0.5-1.0 | 1.0-2.5 | > 2.5 |

### Context
- **S&P 500 baseline**: ~10% annual return, Sharpe ~0.5, max DD ~34% (COVID)
- Sharpe > 1.0 consistently = genuinely good strategy
- Max drawdown matters more than return — surviving drawdowns determines livability
- Win rate alone is misleading — 30% win rate with 5:1 payoff ratio is excellent

### Iteration Workflow
1. Start simple (2-3 filters), run backtest
2. Check Sharpe and max drawdown first
3. Sharpe < 0.5? Filters too loose — tighten or change
4. Max DD > 30%? Add stops or reduce position size
5. Too few trades? Loosen filters or increase topN
6. Too many trades? Tighten reconstitution to quarterly
7. Always modify one variable at a time and re-run

---

## Screen Endpoint

Screen the universe without a full backtest:

```bash
curl -s -X POST https://api.staxlabs.org/api/v1/screen \
  -H "Authorization: Bearer $STAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "filters": [
      { "metric": "return_on_equity", "operator": "gte", "value": 20 },
      { "metric": "price_to_earnings_ratio", "operator": "lte", "value": 15 }
    ],
    "asOfDate": "2024-12-31"
  }' | jq .
```

---

## Strategies

### Save a strategy
```bash
curl -s -X POST https://api.staxlabs.org/api/v1/strategies \
  -H "Authorization: Bearer $STAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Value Strategy",
    "description": "Low P/E, high ROE mega caps",
    "tags": ["value", "large-cap"],
    "parameters": {
      "schemaVersion": 4,
      "fundamentalFilters": [
        { "metric": "return_on_equity", "operator": "gte", "value": 15 },
        { "metric": "price_to_earnings_ratio", "operator": "lte", "value": 20 }
      ],
      "ranking": { "momentumWeight": 50, "fundamentalWeight": 50, "momentumLookback": 6, "topN": 10 },
      "positionSizing": { "maxPositionSize": 0.15, "minPositionSize": 0.02 },
      "riskManagement": { "hardStopLoss": 0.20, "maxDrawdown": 0.35, "exitFailedImmediately": true },
      "rebalancing": { "frequency": "monthly", "weightingMethod": "equal", "reconstitutionFrequency": "quarterly" },
      "tradingCosts": { "commission": { "type": "per_share", "value": 0.005 }, "slippage": { "type": "percentage", "value": 0.001 } }
    }
  }' | jq .
```

Response: `{ "success": true, "strategy": { "id": "uuid", "name": "...", "created_at": "..." } }`

### List your strategies
```bash
curl -s "https://api.staxlabs.org/api/v1/strategies?limit=10&search=value" \
  -H "Authorization: Bearer $STAX_API_KEY" | jq .
```

Query params: `limit` (max 100), `offset`, `search` (name filter)

### Get a strategy by ID
```bash
curl -s https://api.staxlabs.org/api/v1/strategies/STRATEGY_ID \
  -H "Authorization: Bearer $STAX_API_KEY" | jq .
```

Returns the full strategy including `parameters` (the strategy JSON you can pass to `/backtest`).

### Update a strategy
```bash
curl -s -X PUT https://api.staxlabs.org/api/v1/strategies/STRATEGY_ID \
  -H "Authorization: Bearer $STAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Updated Name", "is_public": true }' | jq .
```

Updatable fields: `name`, `description`, `parameters`, `tags`, `is_public`

### Delete a strategy
```bash
curl -s -X DELETE https://api.staxlabs.org/api/v1/strategies/STRATEGY_ID \
  -H "Authorization: Bearer $STAX_API_KEY" | jq .
```

---

## Account

### Get account info
```bash
curl -s https://api.staxlabs.org/api/v1/account \
  -H "Authorization: Bearer $STAX_API_KEY" | jq .
```

Returns: tier, rate limits, requests remaining, active key count, subscription info.

### List API keys
```bash
curl -s https://api.staxlabs.org/api/v1/account/keys \
  -H "Authorization: Bearer $STAX_API_KEY" | jq .
```

### Create a new API key
```bash
curl -s -X POST https://api.staxlabs.org/api/v1/account/keys \
  -H "Authorization: Bearer $STAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My Script" }' | jq .
```

The full key is returned **once** — store it immediately.

### Revoke an API key
```bash
curl -s -X DELETE https://api.staxlabs.org/api/v1/account/keys/KEY_ID \
  -H "Authorization: Bearer $STAX_API_KEY" | jq .
```

---

## Community

### Browse public strategies
```bash
curl -s "https://api.staxlabs.org/api/v1/community/strategies?sort=sharpe&limit=10" \
  -H "Authorization: Bearer $STAX_API_KEY" | jq .
```

Sort options: `popularity` (default), `newest`, `sharpe`, `returns`, `backtests`

### Fork a public strategy
```bash
curl -s -X POST https://api.staxlabs.org/api/v1/community/strategies/STRATEGY_ID/fork \
  -H "Authorization: Bearer $STAX_API_KEY" | jq .
```

Creates a copy in your account that you can modify and backtest.

---

## Workflow: Build → Save → Iterate

The typical API workflow:

1. **Screen** — Find which metrics produce interesting universes
2. **Backtest** — Test a strategy configuration
3. **Save** — Store the strategy if results are promising
4. **Iterate** — Load, modify parameters, re-backtest
5. **Share** — Set `is_public: true` for the community

```bash
# 1. Screen for high-ROE stocks
curl -s -X POST $API/screen -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"filters": [{"metric": "return_on_equity", "operator": "gte", "value": 20}]}' | jq '.result.passedSymbols | length'

# 2. Backtest a strategy
RESULT=$(curl -s -X POST $API/backtest -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"strategy": {...}, "startDate": "2022-01-01", "endDate": "2024-12-31", "initialCapital": 100000}')

# 3. Save if Sharpe > 1.0
echo $RESULT | jq '.result.metrics.sharpeRatio'
curl -s -X POST $API/strategies -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name": "High ROE v1", "parameters": {...}}'

# 4. Load, tweak, re-backtest
STRATEGY=$(curl -s $API/strategies/ID -H "$AUTH" | jq '.strategy.parameters')
# Modify filters, re-run backtest...

# 5. Share with community
curl -s -X PUT $API/strategies/ID -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"is_public": true}'
```

---

## Guardrails

- Max 1000 symbols per backtest
- Max 5 years date range
- Max $100M initial capital
- No ML in API (use Stax Labs UI for ML)
- Equity curve capped at 500 points
- Trades capped at 10,000 in response
- Rate limits: Pro=10/day, Elite=50/day, Unlimited=500/day

---

## Installation

To install this skill in Claude Code:

```bash
git clone https://github.com/Stax-app/stax-skill.git ~/.claude/skills/stax
```

Then use `/stax` in any Claude Code session.
