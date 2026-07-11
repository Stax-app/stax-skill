# Orchestrator prompt — automated Stax short-form videos

Paste everything below the line into your orchestrator agent. Before you do, complete the
**2 remaining human steps** at the bottom (voice API choice + Stax API key).

---

I wanna make a plan for producing good Stax short-form videos (IG Reels / TikTok / YT Shorts, 9:16 vertical) automatically. so my thinking is, there are four parts to a good one of these.

first, the screen footage — the hero asset of every Stax video is the Buddi product flow: a plain-English sentence gets typed into the chat, a strategy builds, a backtest chart appears. we already have real product footage in Google Drive, download these first and inventory what's usable before generating anything:

- `max_walkthrough.mp4` (552MB, full product walkthrough): https://drive.google.com/file/d/1-z_nape6PkhP30dkNf7r0DW6mBbjy-q1/view
- `Screen Recording 2026-04-06 at 10.34.14 PM.mov` (raw screen capture): https://drive.google.com/file/d/1MK-3N9ffdgJXDGtUeSrjF7SrmGQRdczf/view
- `export- FINAL.mp4` (a finished/edited video — use as a style/quality reference for what "done" looks like): https://drive.google.com/file/d/1kJ9kR6yyU8wzVV3NBYRPrsRie-PlzRFZ/view

pull the Buddi flow segments out of the walkthrough and screen recording (sentence typed → questions → strategy builds → chart) and crop/reframe to 9:16. real captures always beat generated UI. if a required beat doesn't exist in the footage (see the shot lists in the scripts), list it as a capture gap and mock it as clean UI motion graphics matching the app's look — never fake a data chart though, see part four.

second, the voice. the videos are narrated in Max's voice — clone it from Max's own speech in `max_walkthrough.mp4` (extract the audio with ffmpeg, pick 2–3 minutes of clean solo speech). use our voice API [HUMAN STEP 1: e.g. ElevenLabs instant voice clone — key in `ELEVENLABS_API_KEY`; swap in whatever provider we settle on]. the read should be 20% faster and more casual than a presentation voice — sharp friend in finance, not a narrator. this is Max's own voice being cloned with his consent, for his own channel — do not clone anyone else's.

third, the editing style — captions burned in on every word, text overlays that punch in every 2–4 seconds, speed-ramped typing, chart reveals with a beat of tension before them. for this, analyze `export- FINAL.mp4` (our own finished video) plus a couple of top-performing finance/money shorts in detail using gemini via openrouter (`OPENROUTER_API_KEY`) — ask multiple questions per video (what happens visually at each second, when does text appear, how do the chart reveals work, what's the cut rhythm) so you can extract the exact editing grammar and reproduce it.

fourth, the guardrails — this is finance content and non-negotiable. the full list is in `content/scripts.md` ("THE 8 NON-NEGOTIABLES") in the repo at https://github.com/Stax-app/stax-skill (branch `claude/stax-content-engine-mocrvp`) — read it before producing anything. the ones you will be most tempted to break: every performance figure shown on screen must carry a visible "Backtest Result" label and the VO must say "would have performed"; never show or invent a ticker, price, allocation, or dollar-earnings claim; and NEVER invent numbers for charts. to get real chart numbers, run a real backtest yourself: `content/backtest/get-verified-figures.sh` in the same repo hits the live Stax API (`https://api.staxlabs.org/api/v1/backtest`, auth via `STAX_API_KEY` [HUMAN STEP 2], strategy JSON at `content/backtest/classic-value.json`, full API docs in `.claude/skills/stax/SKILL.md`) and returns the verified return / Sharpe / max-drawdown figures — those, and only those, may appear on a chart. the CTA is always comment-keyword, never link-in-bio, and "free" only ever refers to building + paper trading, not the live platform.

now remember you're the orchestrator and this is likely going to be a very long task, so use your context carefully — assign the research tasks (footage inventory + segment extraction, voice pipeline setup, style analysis) to opus or fable subagents depending on complexity, and keep only the plan and the verified results in your own context. do the backtest call yourself though (it's one command) so the verified numbers never pass through a lossy summary.

the first video should be "VID 01 — The $1,000 No-Clue Demo" and make another one for "VID 03 — Your First $1,000, Built For You" — both are fully specified (per-beat VO, visuals, on-screen text, timings, keywords: BUDDI for 01, GROW for 03) in `content/scripts.md` in the repo above. follow those scripts beat for beat; your job is production, not rewriting. one thing you cannot fill yourself: VID 03's VO line 2 contains `[REAL COUNT]` (strategies Max has built) — if no verified count is provided to you, produce the video with that line omitted and flag it, don't invent one. some more reference for how a finished one should feel end to end: the `export- FINAL.mp4` linked above, and the prior recreation prompts at `/Users/test/Documents/openmotion/recreate-video-user-prompts.md` if you're running on Max's machine.

when both videos are assembled, stop and output: the two video files, the list of verified figures used (with the raw backtest JSON they came from), any capture gaps you mocked, and the compliance checklist from `content/scripts.md` with each item marked pass/fail. a human reviews that checklist before anything is published — you assemble, you never publish.

---

## The 2 remaining human steps

1. **Voice API** — pick the provider (ElevenLabs is the default assumption above) and put its key in the env. If you already have a Higgs/other endpoint like the openmotion setup, swap that sentence.
2. **Stax API key** — `stax login` on the machine the agent runs on, or set `STAX_API_KEY`. Note rate limits: Pro = 10 backtests/day.

## What was filled in and from where

| Slot | Filled with | Source |
|------|------------|--------|
| Captures | 3 real Drive videos (walkthrough, raw screen rec, finished export) | Google Drive search |
| Voice sample | Max's speech in `max_walkthrough.mp4` | Google Drive |
| Style reference | `export- FINAL.mp4` + external finance shorts | Google Drive |
| Analysis model | gemini via openrouter | your existing setup (per your fireship prompt) |
| Verified data | Live Stax API backtest, ready-made script + strategy JSON | this repo (`content/backtest/`) |
| Scripts | `content/scripts.md`, VID 01 + VID 03 fully specified | this repo |
| Keyword conflict | VID 03 switched BUDDI → GROW | resolved in scripts.md |
| Prior reference | openmotion recreate-video prompts path | your original prompt |
