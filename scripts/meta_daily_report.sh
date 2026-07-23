#!/usr/bin/env bash
# Daily Meta Ads read-only performance report for the Stax ad account.
#
# Security:
#  - Requires META_ACCESS_TOKEN and META_AD_ACCOUNT_ID in the environment
#    or in a .env file next to the repo root. Never prints the token.
#  - Token is sent only to graph.facebook.com, via a curl header file
#    (never on the command line or in URLs).
#  - Read-only: every request is an HTTP GET to the Insights/metadata APIs.
#  - Output is whitelisted fields only; raw responses stay in a temp dir.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -z "${META_ACCESS_TOKEN:-}" ] && [ -f "$ROOT/.env" ]; then
  set -a; source "$ROOT/.env"; set +a
fi
: "${META_ACCESS_TOKEN:?META_ACCESS_TOKEN not set}"
: "${META_AD_ACCOUNT_ID:?META_AD_ACCOUNT_ID not set}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
umask 077
printf 'Authorization: Bearer %s\n' "$META_ACCESS_TOKEN" > "$TMP/hdr"

G="https://graph.facebook.com/v23.0"
CORE="spend,impressions,reach,frequency,cpm,inline_link_clicks,inline_link_click_ctr,cost_per_inline_link_click,actions"

get() { # get <out> <path-and-query> -> echoes http code
  curl -sS -o "$TMP/$1.json" -w '%{http_code}' -H "@$TMP/hdr" --max-time 60 "$G/$2" || echo "000"
}

regs() { # sum complete_registration from an actions array on stdin row
  jq -r '([.actions[]? | select(.action_type=="complete_registration") | .value | tonumber] | add) // 0'
}

row() { # row <file> -> summary line for a single-row insights response
  jq -r 'if (.data | length) == 0 then "no delivery" else .data[0] |
    ( [.actions[]? | select(.action_type=="complete_registration") | .value | tonumber] | add // 0 ) as $regs |
    "spend $\(.spend) | impr \(.impressions) | CPM $\(.cpm | tonumber * 100 | round / 100) | link clicks \(.inline_link_clicks // "0") | link CTR \((.inline_link_click_ctr // "0") | tonumber * 100 | round / 100)% | CPC(link) $\(.cost_per_inline_link_click // "-") | REGISTRATIONS \($regs) | cost/reg \(if $regs > 0 then "$" + ((.spend | tonumber) / $regs * 100 | round / 100 | tostring) else "n/a" end)"
    end' "$1"
}

echo "==================================================================="
echo "META ADS DAILY REPORT — account ${META_AD_ACCOUNT_ID}"
echo "==================================================================="

echo
echo "--- YESTERDAY (account) ---"
c=$(get y_acct "$META_AD_ACCOUNT_ID/insights?date_preset=yesterday&level=account&fields=$CORE")
[ "$c" = "200" ] && row "$TMP/y_acct.json" || echo "ERROR HTTP $c"

echo
echo "--- LAST 7 DAYS (account) ---"
c=$(get w_acct "$META_AD_ACCOUNT_ID/insights?date_preset=last_7d&level=account&fields=$CORE")
[ "$c" = "200" ] && row "$TMP/w_acct.json" || echo "ERROR HTTP $c"

echo
echo "--- PER AD, LAST 7 DAYS ---"
c=$(get w_ads "$META_AD_ACCOUNT_ID/insights?date_preset=last_7d&level=ad&fields=ad_name,adset_name,$CORE&limit=100")
if [ "$c" = "200" ]; then
  jq -r '.data[]? |
    ( [.actions[]? | select(.action_type=="complete_registration") | .value | tonumber] | add // 0 ) as $regs |
    "\(.ad_name) [\(.adset_name)]: spend $\(.spend) | CPM $\(.cpm | tonumber * 100 | round / 100) | linkCTR \((.inline_link_click_ctr // "0") | tonumber * 100 | round / 100)% | regs \($regs)"' "$TMP/w_ads.json"
else echo "ERROR HTTP $c"; fi

echo
echo "--- DEMOGRAPHICS, LAST 7 DAYS (age x gender) ---"
c=$(get w_demo "$META_AD_ACCOUNT_ID/insights?date_preset=last_7d&level=account&breakdowns=age,gender&fields=spend,impressions,inline_link_clicks,actions&limit=200")
if [ "$c" = "200" ]; then
  jq -r '.data | sort_by(-(.spend|tonumber)) | .[]? |
    ( [.actions[]? | select(.action_type=="complete_registration") | .value | tonumber] | add // 0 ) as $regs |
    "\(.age) \(.gender): spend $\(.spend) | regs \($regs)"' "$TMP/w_demo.json"
else echo "ERROR HTTP $c"; fi

echo
echo "--- PLACEMENTS, LAST 7 DAYS ---"
c=$(get w_plc "$META_AD_ACCOUNT_ID/insights?date_preset=last_7d&level=account&breakdowns=publisher_platform,platform_position&fields=spend,impressions,inline_link_clicks,actions&limit=200")
if [ "$c" = "200" ]; then
  jq -r '.data | sort_by(-(.spend|tonumber)) | .[]? |
    ( [.actions[]? | select(.action_type=="complete_registration") | .value | tonumber] | add // 0 ) as $regs |
    "\(.publisher_platform)/\(.platform_position): spend $\(.spend) | linkclicks \(.inline_link_clicks // "0") | regs \($regs)"' "$TMP/w_plc.json"
else echo "ERROR HTTP $c"; fi

echo
echo "--- ACTIVE AD SETS + BUDGETS (sanity: total daily budget) ---"
c=$(get adsets "$META_AD_ACCOUNT_ID/adsets?fields=name,effective_status,daily_budget&limit=100")
if [ "$c" = "200" ]; then
  jq -r '.data[] | select(.effective_status=="ACTIVE") | "\(.name): $\((.daily_budget | tonumber) / 100)/day"' "$TMP/adsets.json"
  jq -r '[.data[] | select(.effective_status=="ACTIVE") | .daily_budget | tonumber] | add // 0 | "TOTAL ACTIVE DAILY BUDGET: $\(. / 100)"' "$TMP/adsets.json"
else echo "ERROR HTTP $c"; fi

echo
echo "--- AUTOMATED FLAGS ---"
jq -r --arg none "none" '
  if (.data | length) == 0 then "FLAG: no delivery yesterday — check ad statuses/review"
  else .data[0] |
    ( [.actions[]? | select(.action_type=="complete_registration") | .value | tonumber] | add // 0 ) as $regs |
    [
      (if (.cpm | tonumber) > 40 then "FLAG: CPM $\(.cpm | tonumber * 100 | round / 100) is above the $40 tripwire" else empty end),
      (if (.spend | tonumber) > 30 then "FLAG: yesterday spend $\(.spend) exceeded $30 (budget is $25/day)" else empty end),
      (if $regs > 0 and ((.spend | tonumber) / $regs) > 15 then "FLAG: cost per registration $\((.spend | tonumber) / $regs * 100 | round / 100) is above the $15 target" else empty end)
    ] | if length == 0 then "none" else .[] end
  end' "$TMP/y_acct.json" 2>/dev/null || echo "(flags unavailable)"
echo "==================================================================="
