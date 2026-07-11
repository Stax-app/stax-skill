# PASTE-READY: automated Stax video production (fully standalone)

Everything the agent needs is inline — scripts, guardrails, backtest command, asset links,
and fallbacks for any key that isn't set. Paste the whole thing below this line.

---

I wanna make a plan for producing two Stax short-form videos (IG Reels / TikTok / YT Shorts, 9:16 vertical) automatically, end to end, starting now. both scripts are fully written and included at the bottom of this prompt — your job is production, not rewriting. so my thinking is, there are four parts to a good one of these, and each part has a fallback so you never stall waiting on me.

first, the screen footage — the hero asset of every Stax video is the Buddi product flow: a plain-English sentence typed into the chat, a strategy builds, a backtest chart appears. we have real product footage in Google Drive, download and inventory these first:

- `max_walkthrough.mp4` (552MB, full product walkthrough): https://drive.google.com/file/d/1-z_nape6PkhP30dkNf7r0DW6mBbjy-q1/view
- `Screen Recording 2026-04-06 at 10.34.14 PM.mov` (raw screen capture): https://drive.google.com/file/d/1MK-3N9ffdgJXDGtUeSrjF7SrmGQRdczf/view
- `export- FINAL.mp4` (a finished edited video — this is the quality bar): https://drive.google.com/file/d/1kJ9kR6yyU8wzVV3NBYRPrsRie-PlzRFZ/view

extract the Buddi flow segments (sentence typed → questions → strategy builds → chart), crop/reframe to 9:16. real captures always beat generated UI. FALLBACK: if a required beat from the shot lists doesn't exist in the footage, recreate it as clean UI motion graphics matching the app's visual style, and log it in your final report as a capture gap — but never fabricate a data chart with numbers on it (see part four).

second, the voice. narration is in Max's voice — clone it from Max's own speech in `max_walkthrough.mp4` (extract audio with ffmpeg, select 2–3 minutes of clean solo speech). use ElevenLabs instant voice clone if `ELEVENLABS_API_KEY` is set, or whatever voice API key you find configured. the read: 20% faster and more casual than a presentation voice — sharp friend in finance, not a narrator. this is Max's own voice, cloned with his consent, for his own channel — never clone anyone else's. FALLBACK: if no voice API key is available, fully assemble both videos with burned-in captions carrying the script, a stock music bed, and a neutral placeholder TTS scratch track; export each VO line as a numbered text file with exact timings so Max can record or re-dub in one session. flag "VO is placeholder" in your report. do not stall on this.

third, the editing style. if `OPENROUTER_API_KEY` is set, analyze `export- FINAL.mp4` plus 2–3 top-performing finance shorts with gemini — ask multiple questions per video (what happens visually each second, when text appears, how chart reveals work, the cut rhythm) and extract the editing grammar. FALLBACK: if no analysis model is available, use this grammar spec directly, it is sufficient: word-by-word burned captions, centered, safe from platform UI (bottom 25% clear); a visual change (cut, zoom punch-in, or text overlay) every 2–4 seconds, never longer; typing moments speed-ramped ~1.5×; one beat (~0.5s) of hold before every chart reveal; on-screen text overlays exactly as specified per beat in the scripts below; end card holds the CTA text for the final 4–5 seconds.

fourth, the guardrails — this is finance content and every one of these is a hard rule; a violation means the video does not ship:

1. every performance figure shown on screen carries a visible "Backtest Result" label, and the VO only ever says "would have performed" — never "made," "worked," "returned," or "earned."
2. no stock tickers, no named companies as picks, no specific prices, no allocations, no price targets. ever.
3. no income or return claims. credibility comes from process metrics only.
4. never invent numbers. real chart figures come ONLY from a live backtest you run yourself:

```bash
curl -s -X POST https://api.staxlabs.org/api/v1/backtest \
  -H "Authorization: Bearer $STAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": {
      "name": "Classic Value — Video Demo",
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
    "startDate": "2022-01-01", "endDate": "2024-12-31", "initialCapital": 100000
  }' | jq '.result.metrics | {totalReturn, sharpeRatio, maxDrawdown, winRate}'
```

   use `.totalReturn` for the chart, keep the raw JSON response in your final report as the source of truth. rate limit is ~10 backtests/day so run it once, not iteratively. FALLBACK: if `STAX_API_KEY` isn't set or the API is unreachable, render every chart with its shape and the "Backtest Result" label but NO numeric values on screen, and adjust nothing in the VO (the scripts never speak a performance number). flag "charts need verified figures" in your report.
5. "free" only ever refers to building strategies + paper trading on real prices. the live/full platform is a paid subscription — never imply otherwise.
6. Buddi is a tool the user drives. never "we invest for you," never robo-advisor framing.
7. the CTA is always comment-keyword ("Comment 'BUDDI'…"), never link-in-bio.
8. the product is called Buddi, the company is Stax Labs, the site is yourstax.app. never alter these.

now remember you're the orchestrator and this is likely going to be a long task, so use your context carefully — assign the research tasks (footage inventory + segment extraction, voice pipeline, style analysis) to opus or fable subagents depending on complexity, and keep only the plan and verified results in your own context. run the backtest call yourself (it's one command) so verified numbers never pass through a lossy summary. more reference for how a finished video should feel: `export- FINAL.mp4` above, and if you're on Max's machine, `/Users/test/Documents/openmotion/recreate-video-user-prompts.md`.

one thing you may not fill yourself: VID B's second VO line contains `[REAL COUNT]` (the number of strategies Max has built). if no verified count was given to you, drop that line, tighten the beat, and flag it — never invent the number.

when both videos are assembled, stop and output: (1) the two video files, (2) every figure shown on screen with the raw backtest JSON it came from, (3) capture gaps you mocked, (4) VO status (cloned or placeholder), and (5) the 8 guardrails above each marked pass/fail. a human reviews that before anything is published — you assemble, you never publish.

---

## VIDEO A — "The $1,000 No-Clue Demo" (~35s, 100% screen + VO, keyword: BUDDI)

| # | Time | VO (exact) | Visual | On-screen text |
|---|------|-----------|--------|----------------|
| 1 | 0–3s | "I had $1,000 sitting in cash and no clue what to do with it — so I typed that exact sentence into an AI." | Thumb typing *"I have $1,000 and no clue what to do with it"* into Buddi chat. No logo. Speed-ramp typing so it completes by 3s. | — |
| 2 | 3–8s | "That's most of us, right? You want your money to grow — but *where do I even start* freezes you, so it just sits there." | Cut to a boring bank balance, cash doing nothing. | "just… sitting there 💤" |
| 3 | 8–14s | "Turns out there's now an AI built for your money. And you don't even need an idea — if you don't have one, it just asks you a few simple questions." | Buddi responds with 2–3 simple multiple-choice questions; thumb taps answers. | — |
| 4 | 14–26s | "Here's the part that got me — I answered a few, and it built the whole thing. A real, rules-based strategy. Then it showed me how it *would have* performed on actual past prices." | Strategy assembles → results chart appears. Unbroken take from last tap to chart. | **"Backtest Result"** on chart — REQUIRED |
| 5 | 26–32s | "And I could paper-trade it on real prices — free — before risking a single dollar." | "Paper Trade" toggle, "$0 to try" beat. | "paper trade = free, real prices" |
| 6 | 32–37s | "Comment 'BUDDI' and I'll DM you the link to try it free." | End card. | Comment "BUDDI" 👇 |

**Caption:** You don't need an idea. You just need to say you want to grow it. Comment **BUDDI** and I'll send you the link to try it free. *Backtests are hypothetical — past performance doesn't guarantee future results.*

---

## VIDEO B — "Your First $1,000, Built For You" (~48s, faceless: screen + motion text + VO, keyword: GROW)

| # | Time | VO (exact) | Visual | On-screen text |
|---|------|-----------|--------|----------------|
| 1 | 0–3s | "Here's exactly how to put your first $1,000 to work — without picking a single stock yourself." | Big "$1,000" motion text with blinking cursor; it types out "→ where does it go?" | "$1,000 →" |
| 2 | 3–9s | "I'm Max, and this year I've built over [REAL COUNT] tested strategies without ever picking a stock on gut — so hit follow if you want your money actually working." *(drop this line if no verified count provided — see above)* | Strategy list/dashboard scrolling slowly. | "follow" prompt overlay |
| 3 | 9–15s | "Here's the move. Instead of *you* guessing, you tell an AI called Buddi one sentence: 'I've got $1,000 and no idea what to do with it.'" | That exact sentence typed into Buddi. | — |
| 4 | 15–21s | "Then it just asks you a few simple things. First: how soon you'll need the money — sooner means it plays it safer." | Buddi's first question, one tap. | — |
| 5 | 21–27s | "Then: how you'd actually feel watching it drop hard in a rough month — that's your *real* risk tolerance, not the brave one in your head." | Risk question, tap. Hold an extra beat. | "your real one 👀" |
| 6 | 27–34s | "Then: do you want it growing as fast as possible, or paying you steady cash. Then: what you already own, so it doesn't pile you into more of the same." | Two more quick taps. | — |
| 7 | 34–39s | "A couple more like that — and yeah, some of them circle the same thing on purpose. It's triangulating you, not quizzing you." | Progress completing. | — |
| 8 | 39–48s | "Answer those, and it builds the whole thing for you — a complete, diversified strategy for your $1,000 — and shows you how it *would have* performed on real past prices before you risk a cent." | Strategy assembles → results chart. | **"Backtest Result"** — REQUIRED |
| 9 | 48–53s | "Comment 'GROW' and I'll DM you the link — building it and paper-trading on real prices is totally free." | End card. | Comment "GROW" 👇 |

**Caption:** Your first $1,000 doesn't need a finance degree — it needs one sentence. Comment **GROW** and I'll send you the link to try it free. *Backtests are hypothetical — past performance doesn't guarantee future results.*

**Production note for Video B:** if the questions Buddi actually asks in the footage differ in content or order from beats 4–6, re-time the VO to match the *real* questions rather than showing questions that don't appear on screen — the VO wording for those beats may be lightly adjusted to stay truthful to the footage, everything else is verbatim.
