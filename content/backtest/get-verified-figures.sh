#!/usr/bin/env bash
# Generate REAL, verified backtest figures for video charts.
# Every number shown in a video must come from this output (or the Stax UI),
# never from imagination. Requires STAX_API_KEY (or `stax login` first).
#
# Usage: ./get-verified-figures.sh [strategy.json]
set -euo pipefail

STRATEGY="${1:-$(dirname "$0")/classic-value.json}"
API="https://api.staxlabs.org/api/v1"

if command -v stax >/dev/null 2>&1; then
  # CLI path (preferred)
  stax backtest "$STRATEGY"
else
  # Raw API path
  : "${STAX_API_KEY:?Set STAX_API_KEY or install the stax CLI and run 'stax login'}"
  curl -s -X POST "$API/backtest" \
    -H "Authorization: Bearer $STAX_API_KEY" \
    -H "Content-Type: application/json" \
    -d @"$STRATEGY" |
  jq '{
    verified_for_video: {
      totalReturn:  .result.metrics.totalReturn,
      sharpeRatio:  .result.metrics.sharpeRatio,
      maxDrawdown:  .result.metrics.maxDrawdown,
      winRate:      .result.metrics.winRate,
      trades:       (.result.trades | length),
      period:       { start: .result.startDate, end: .result.endDate }
    },
    reminder: "Label on screen as: Backtest Result. VO: would have performed. Past performance does not guarantee future results."
  }'
fi
