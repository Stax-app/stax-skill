# Stax Labs — Claude Code Skill

Build, backtest, and screen investment strategies from [Claude Code](https://claude.ai/code).

68 fundamental metrics. 5-year backtests. Risk management, position sizing, rebalancing — all configurable from natural language.

## Install

```bash
git clone https://github.com/Stax-app/stax-skill.git ~/.claude/skills/stax
```

Then use `/stax` in any Claude Code session.

## Setup

1. Get an API key from your [Stax Labs](https://staxlabs.org) account (Pro tier or above)
2. Set your key:
```bash
export STAX_API_KEY=sk_your_key_here
```

## What You Can Do

**Build strategies in plain English:**
> "Build me a value strategy with P/E under 15, ROE above 15%, and low debt"

**Backtest against real data:**
> "Test this strategy from 2020 to 2024 with $100K"

**Screen the universe:**
> "What stocks pass a quality filter right now — high margins, low debt, large cap?"

**Iterate and compare:**
> "Try increasing momentum weight to 70% and adding a trailing stop"

## Example

```
You: Build a quality momentum strategy and backtest it

Claude: I'll create a strategy with quality filters (high margins, strong ROE)
        and momentum-heavy ranking, then backtest 2020-2024...

        Results:
        - Total Return: 142%
        - Sharpe Ratio: 1.4
        - Max Drawdown: -18%
        - Win Rate: 58%

        The quality filters narrowed to 180 stocks. ROE > 15% was the
        tightest filter. Want to try adding a PE cap?
```

## 68 Available Metrics

| Category | Metrics | Examples |
|----------|---------|---------|
| Valuation | 15 | P/E, P/B, EV/EBITDA, PEG, earnings yield |
| Profitability | 11 | ROE, ROA, ROIC, gross/net/operating margins |
| Quality | 5 | Income quality, intangibles ratio, SBC/revenue |
| Growth | 5 | EPS, revenue/share, book value/share |
| Safety | 10 | Current ratio, D/E, interest coverage |
| Efficiency | 11 | Asset turnover, DSO, cash conversion cycle |
| Size | 1 | Market cap |
| Cash Flow | 10 | FCF yield, dividend yield, capex coverage |

Full metric reference with operators and value ranges is in the [skill file](.claude/skills/stax/SKILL.md).

## Requirements

- [Claude Code](https://claude.ai/code) (CLI, desktop app, or IDE extension)
- Stax Labs account with Pro tier or above
- API key (`sk_...`)

## Links

- [Stax Labs](https://staxlabs.org) — the platform
- [API Documentation](.claude/skills/stax/SKILL.md) — full schema reference

## License

MIT
