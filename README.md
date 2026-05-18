# Stax Labs

Build, backtest, deploy, and manage investment strategies from your terminal or any AI coding agent.

Works with **Claude Code**, **Codex**, and the **Stax CLI**.

## Install

**Claude Code:**
```bash
git clone https://github.com/Stax-app/stax-skill.git ~/.claude/skills/stax
```

**Codex:**
```bash
git clone https://github.com/Stax-app/stax-skill.git ~/.agents/skills/stax
```

**CLI (optional — adds `stax` command globally):**
```bash
cd ~/.claude/skills/stax/cli && ./setup.sh
stax login
```

`stax login` opens your browser, you sign in with Google, and your terminal is connected automatically. No key pasting.

## What You Get

### AI Agent Skill

Use `/stax` in Claude Code or mention the skill in Codex to build strategies with natural language:

```
You: Build me a value strategy — high ROE, low debt, large caps — and backtest it

Agent: 181 symbols screened, 105 trades over 2 years.
       +14.7% return, 0.25 Sharpe, 14.3% max drawdown, 53% win rate.
       Want to add a trailing stop or adjust the momentum weight?
```

### Interactive CLI

Run `stax` with no arguments for a guided strategy builder:

- **5 presets** with trailing stops (Momentum Quality, Classic Value, Dividend Compounder, Cash Machine, Large Cap Core)
- **13 traits** in plain English ("Uses money efficiently", "Pays shareholders")
- **68 metrics** grouped by category
- **Trade-by-trade results** after each backtest
- **Tweak and compare** — change a filter, auto-rerun, see the delta
- **Save, deploy, fork** — full strategy lifecycle from the terminal

### Direct Commands

```bash
stax backtest strategy.json --start 2022-01-01 --end 2024-12-31
stax screen --roe ">15" --pe "<20"
stax strategies list
stax deploy strategy.json --name "Paper Trade" --capital 10000
stax community --sort sharpe
```

## Auth

```bash
stax login              # opens browser, auto-connects (zero paste)
stax login --key sk_... # one-liner for CI/agents
stax whoami             # check status
stax logout
```

## Presets

| Preset | Momentum | Filters | Top N |
|--------|----------|---------|-------|
| Momentum Quality | 80% | ROE > 12%, Gross Margin > 30%, MCap > $5B | 10 |
| Classic Value | 50% | ROE > 15%, D/E < 1.5, MCap > $10B | 15 |
| Dividend Compounder | 30% | Div Yield > 2%, D/E < 1.5, MCap > $5B | 20 |
| Cash Machine | 50% | FCF Yield > 5%, Op Margin > 15%, MCap > $2B | 15 |
| Large Cap Core | 50% | ROE > 10%, MCap > $20B | 20 |

All include 15% hard stop, 8-10% trailing stop (activates at 10% profit), 25% max drawdown circuit breaker.

## 68 Metrics

| Category | Examples |
|----------|---------|
| Valuation | P/E, P/B, EV/EBITDA, PEG, earnings yield, FCF yield |
| Profitability | ROE, ROA, ROIC, gross/net/operating margins |
| Growth | EPS, revenue/share, book value/share, FCF/share |
| Safety | Current ratio, D/E, interest coverage, net debt/EBITDA |
| Efficiency | Asset turnover, inventory turnover, DSO, cash conversion cycle |
| Cash Flow | Dividend yield, payout ratio, OCF ratio, capex/OCF |

Full reference: [SKILL.md](.claude/skills/stax/SKILL.md)

## API

21 endpoints at `api.staxlabs.org/api/v1/` — backtest, screen, strategies, deployments, account, community. Full docs in the skill file.

## Requirements

- AI coding agent (Claude Code, Codex) or Node.js 18+
- [Stax Labs](https://staxlabs.org) account (Pro tier for API)

## Links

- [staxlabs.org](https://staxlabs.org)
- [Skill reference](.claude/skills/stax/SKILL.md)

MIT
