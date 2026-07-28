---
format: 1080x1920
message: "Your first $1,000 doesn't need a finance degree — one sentence into Buddi and it builds a complete, diversified, backtested strategy you can paper-trade free."
arc: Demo Loop — hook → the move (one sentence) → question demo ×3 → triangulation → build + backtest proof → CTA
audience: "First-time investor with ~$1,000, afraid of picking stocks"
mode: autonomous
music: none available offline — logged as gap; SFX only
---

## Video direction

- **Palette system** (real Buddi product UI): near-black `#0B0E11` ground; product GREEN `#2BD97C` carries every accent — stepper checks, selected chips, chart stroke, CTA. Negative/sell markers orange `#F97316`; red is NOT used in this video. Headlines near-white `#F2F5F4`; muted `#A8B3AE`. Cards `#11161A`/`#0F1418` with green-tinted borders. User chat bubble = dark green-tinted gradient rounded bubble, white text, right-aligned. Buddi reply = plain text + teal avatar circle + "Buddi" label. Top stepper chrome ("Find stocks — Build the strategy — Test live") appears on all in-app frames.
- **Editing grammar (from the brief's spec — binding):** a visual change (reveal, cut, zoom punch-in, or text overlay) every 2–4 seconds, never longer; typing moments speed-ramped ~1.5× (fast, confident keystrokes); one beat (~0.5s) of HOLD before every chart reveal; on-screen text overlays exactly as specified per beat; end card holds the CTA for the final 4–5s.
- **Captions:** burned-in word-by-word karaoke pill, horizontally centered, seated ABOVE the platform-UI zone — the caption band sits at ~y1300, and the bottom 25% of the canvas (below y1440) stays completely clear. Frame content therefore composes into the top ~65% (everything above y≈1250).
- **Motion grammar**: PLAYFUL but disciplined — every frame owns ONE bold visual metaphor executed with craft (odometer roll, radar sweep, acting chart, conveyor build, growing sprout); smooth long-tail settles (`power3`) as the base; up to TWO sanctioned character pops per frame (this video is allowed more personality than Video A); every reveal still lands on its spoken cue; stillness during holds. All motion deterministic and seek-safe — finite tweens only.
- **GUARDRAILS (hard rules — a violation means no ship):** every performance chart carries a visible "Backtest Result" label; NO numeric performance values anywhere (no verified backtest available — charts are shape + label only); NO stock tickers, named companies, prices, allocations, or targets; "free" refers only to building + paper trading; Buddi is a tool the user drives (never "invests for you"); CTA is comment-keyword only; product = Buddi, company = Stax Labs, site = yourstax.app.

## Frame 1 — The $1,000 hook

- scene: Big "$1,000" motion text with a blinking green cursor; it types out "→ where does it go?" beneath. On-screen text: "$1,000 →"
- voiceover: "Here's exactly how to put your first $1,000 to work in 2026 — without picking a single stock yourself."
- duration: 5.824s
- transition_in: cut
- status: animated
- src: compositions/frames/01-thousand-hook.html
- type: hook
- persuasion: Curiosity + specificity — "exactly how" promises a runnable recipe
- beat: curiosity
- blueprint: typewriter-reveal (Adapt — big-numeral variant)
- focal: the giant $1,000 numeral
- roles: $1,000 numeral = cutout (hero) · typed sub-line = supporting · dark field = background
- sfx: typing, pop
- asset_candidates: none — hand-built motion text (capture gap: no footage downloadable; see report)

Adapt: keep the signature — live type-on with caret is the engine; the payoff is the typed question, not a brand pop.
Scene 1 (0.0–1.6s): near-black field; giant near-white "$1,000" (Space Grotesk 700, ~220px) scales down from oversized into upper-center as the VO opens; a green caret blinks beside it. Centered, numeral ≥ 50% width, 2 depth layers.
Scene 2 (1.6–3.2s): on "without picking a single stock," the caret drops to a second line and TYPES "→ where does it go?" fast (~1.5× ramp, discrete-text-sequence), green arrow glyph leading. 
Scene 3 (3.2–4.0s): both lines settle; a soft green glow blooms faintly behind the numeral (ambient-glow-bloom); still hold.

narrativeRole: Hook — names the exact viewer (first $1,000) and the exact fear (picking stocks) in one breath.
keyMessage: There's a way to deploy your first $1,000 without stock-picking.

## Frame 2 — Follow beat: the strategy shelf

- scene: A strategy dashboard flashes — a scrolling list of strategy cards (generic names, NO tickers) with green "tested" ticks; a counter rolls to "40+ strategies tested"; a follow button gets tapped and flips to "Following ✓".
- voiceover: "I'm Max, and this year I've built over 40 tested strategies without ever picking a stock on gut — so hit follow if you want your money actually working."
- duration: 6.848s
- transition_in: crossfade
- status: outline
- src: compositions/frames/02-follow-dashboard.html
- type: social_proof
- persuasion: Authority by volume of process — 40 tested strategies, zero gut picks
- beat: credibility
- blueprint: grid-card-assemble (Adapt — scrolling strategy list + counter)
- focal: the scrolling strategy list
- roles: strategy list = cutout (hero) · counter + follow button = supporting · dark field = background
- sfx: pop, click
- asset_candidates: none — hand-built dashboard recreation (capture gap: talking-head footage unavailable)

Adapt: keep the stagger-assemble signature — strategy cards cascade in and the list SCROLLS slowly upward while the counter rolls; the follow tap is the payoff.
Scene 1 (0.0–2.4s): on "I'm Max, and this year," a dashboard header "MY STRATEGIES" (uppercase tracked chrome) lands upper-third with a counter that rolls 0→40+ (deterministic object-value fromTo, integer, lands on "over 40" cue); beneath it strategy cards cascade in (dark cards, green tick icon + generic names: "Steady growth blend", "Dividend tilt", "Momentum screen", "Low-vol core", "Value filter"…) — NO tickers, NO company names, NO performance numbers.
Scene 2 (2.4–4.6s): on "without ever picking a stock on gut," the list SCROLLS slowly upward (one finite translate) revealing more cards — the volume IS the message; each passing card's tick draws (svg-path-draw, staggered).
Scene 3 (4.6–6.0s): on "hit follow," a follow button (green solid pill "Follow") slides in bottom-right of the content zone; the finger tap-highlight lands it (press-release-spring + ripple — the frame's sanctioned pop) and it flips to a dark "Following ✓" state; settle still.

narrativeRole: Credibility beat — process volume (40 tested strategies) without a single named pick, plus the platform-native follow ask.
keyMessage: This guy tests strategies for a living — follow.

## Frame 3 — One sentence into Buddi

- scene: The product input bar; the exact sentence "I've got $1,000 and no idea what to do with it" types in fast (~1.5× speed-ramp) and sends as the green-tinted user bubble. Top stepper chrome appears.
- voiceover: "Here's the move. Instead of you guessing, you tell an AI called Buddi one sentence: 'I've got $1,000 and no idea what to do with it.'"
- duration: 6.955s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-one-sentence.html
- type: product_intro
- persuasion: Friction reduction — the entire "move" is one plain-English sentence
- beat: relief + intrigue
- blueprint: typewriter-reveal (Reproduce — product-input variant)
- focal: the typed sentence in the input bar
- roles: input bar = cutout (hero) · stepper chrome = supporting · dark field = background
- sfx: typing, pop
- asset_candidates: none — hand-built product-UI recreation (capture gap)

Reproduce: type-on with caret → send → sent bubble, exactly the Buddi flow; typing speed-ramped ~1.5× per the grammar spec.
Scene 1 (0.0–1.4s): stepper chrome ("Find stocks — Build the strategy — Test live", first check green) settles at top; the dark input bar (#12171B, green send button) rises center as the VO sets up "here's the move". 
Scene 2 (1.4–4.4s): on "one sentence," the sentence "I've got $1,000 and no idea what to do with it" TYPES fast with the green caret (discrete-text-sequence, ~1.5× ramp), input border warming green as it fills.
Scene 3 (4.4–6.0s): tap-highlight lands the send button (cursor-click-ripple + press-release-spring); the input morphs into the right-aligned green-tinted user bubble (card-morph-anchor); Buddi typing dots fade in lower-left; settle.

narrativeRole: The move — replaces "guessing" with a single typed sentence; the product enters as the answer's address.
keyMessage: You don't pick — you say one sentence to Buddi.

## Frame 4 — Question 1: timeline

- scene: Buddi replies, then question card 1 — "When will you need this money?" — with three chips; one tap selects, the chip fills green.
- voiceover: "Then it just asks you a few simple things. First: how soon you'll need the money — sooner means it plays it safer."
- duration: 4.715s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/03-question-timeline.html
- type: feature_showcase
- persuasion: Show-don't-tell — the "simple things" are literally three tappable chips
- beat: ease
- blueprint: cursor-ui-demo (Adapt — single-question tap)
- focal: the timeline question card
- roles: question card = cutout (hero) · Buddi reply = supporting · dark field = background
- sfx: click-soft, click
- asset_candidates: none — hand-built question-card recreation (capture gap)

Adapt: one question, one tap — the camera stays put; the interaction is the beat.
Scene 1 (0.0–2.2s): Buddi's teal avatar + "Buddi" label with plain-text reply "A few quick questions first." types on; VO: "it just asks you a few simple things."
Scene 2 (2.2–4.4s): on "how soon you'll need the money," question card 1 slides up (#11161A card): "When will you need this money?" + chips "Under a year / A few years / 5+ years"; the tap-highlight lands "A few years" — chip fills solid green, near-black text (press-release-spring + ripple).
Scene 3 (4.4–6.0s): on "plays it safer," a small muted annotation "sooner = safer" fades in under the card; settle still.

narrativeRole: Question demo 1 — the first concrete proof that "no idea needed" works: a calendar question anyone can answer.
keyMessage: Question one is about time, not tickers.

## Frame 5 — Question 2: your real risk tolerance

- scene: Risk question card — "A rough month hits and it drops hard. What do you do?" — chips tapped; held an extra beat. On-screen text: "your real one 👀"
- voiceover: "Then: how you'd actually feel watching it drop 20% in a rough month — that's your real risk tolerance, not the brave one in your head."
- duration: 5.888s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/04-question-risk.html
- type: feature_showcase
- persuasion: Insight reframe — "your real risk tolerance vs the brave one in your head" earns trust
- beat: self-recognition
- blueprint: cursor-ui-demo (Adapt — single-question tap, held resolve)
- focal: the risk question card
- roles: risk card = cutout (hero) · "your real one" tag = supporting · dark field = background
- sfx: click-soft, click
- asset_candidates: none — hand-built question-card recreation (capture gap)

Adapt: same single-tap shape as Frame 3; the change is the deliberate extra-beat HOLD after the tap (per the beat sheet).
Scene 1 (0.0–2.4s): question card slides up: "A rough month hits and it drops hard. What do you do?" + chips "Sell it / Hold on / Buy more" as the VO describes the feeling; nothing else on screen.
Scene 2 (2.4–4.0s): the tap-highlight hovers... then lands "Hold on" — green fill (press-release-spring); on "your real risk tolerance," the on-screen tag "your real one" with a small eyes-glyph (inline SVG, not emoji) pops in beside the card.
Scene 3 (4.0–6.0s): on "not the brave one in your head," everything holds an extra beat — dead still, letting the reframe land.

narrativeRole: Question demo 2 — the smartest line in the script gets the quietest frame; the hold sells it.
keyMessage: Buddi measures the real you, not the confident you.

## Frame 6 — Questions 3 + 4: growth vs cash, what you own

- scene: Two quick taps — "Grow fast or steady cash?" then "What do you already own?" — back to back, camera stepping down between them.
- voiceover: "Then: do you want it growing as fast as possible, or paying you steady cash. Then: what you already own, so it doesn't pile you into more of the same."
- duration: 6.549s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-questions-growth-own.html
- type: feature_showcase
- persuasion: Momentum — two questions in one breath makes the whole flow feel fast
- beat: momentum
- blueprint: cursor-ui-demo (Adapt — two-tap sequence, camera servo)
- focal: the two question cards
- roles: question cards = cutout (heroes) · dark field = background
- sfx: click-soft, click, click
- asset_candidates: none — hand-built question-card recreation (capture gap)

Adapt: keep the camera-chases-the-interaction signature — two discrete taps, one pan between them.
Scene 1 (0.0–3.2s): question card "What's the goal for it?" + chips "Grow as fast as possible / Pay me steady cash" — tap lands "Grow as fast as possible" (green fill) on the VO's first "Then:".
Scene 2 (3.2–5.6s): camera servos down (viewport-change) to card "What do you already own?" + chips "Nothing yet / Some stocks / A retirement fund" — tap lands "Nothing yet" on the second "Then:".
Scene 3 (5.6–7.0s): on "more of the same," both answered chips condense into compact green summary pills stacking left; settle.

narrativeRole: Question demo 3 — pace quickens; diversification logic ("doesn't pile you into more of the same") shown as a plain question.
keyMessage: Even diversification is just a question about you.

## Frame 7 — Triangulating you

- scene: Progress completing — the answered chips orbit into a profile: a progress ring fills as summary pills connect with thin lines to a center "Your profile" node; two "circling" questions glow to show overlap on purpose.
- voiceover: "A couple more like that — and yeah, some of them circle the same thing on purpose. It's triangulating you, not quizzing you."
- duration: 5.013s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-triangulating.html
- type: benefit_highlight
- persuasion: Objection pre-empt — repeat questions reframed as method, not annoyance
- beat: trust
- blueprint: compose (constellation of answers → progress ring)
- focal: the profile ring with connected answer pills
- roles: progress ring + center node = cutout (hero) · answer pills = supporting · dark field = background
- sfx: chime
- asset_candidates: none — hand-built progress/constellation graphic (capture gap)

Compose: the five answered pills (from frames 3–5, plus one "…" pill for "a couple more") arrange in a loose ring; thin green connector lines draw to a center node; a progress ring around the node fills to full.
Scene 1 (0.0–1.8s): the answered pills drift into a ring layout (center-outward-expansion, short-path) as the VO says "a couple more like that"; a "…" pill joins them.
Scene 2 (1.8–3.6s): on "circle the same thing on purpose," two pills briefly glow in sequence (asr-keyword-glow) showing the overlap; connector lines draw to the center node (svg-path-draw).
Scene 3 (3.6–5.0s): on "triangulating you," the progress ring around the center node sweeps to full (stat-bars-and-fills ring) and the label "Your profile" fades in; hold still.

narrativeRole: The trust beat — turns the "too many questions" objection into the product's intelligence.
keyMessage: The questions aren't a quiz — they're how it locks onto you.

## Frame 8 — It builds the whole thing + backtest

- scene: Strategy rule cards assemble (NO tickers, no named companies) → a 0.5s HOLD → the results chart draws under a "Backtest Result" label — chart is SHAPE ONLY, no numeric values anywhere. Fine print: "For educational purposes only. Backtested results do not represent actual trading outcomes. Past performance is not indicative of future results. Not investment advice."
- voiceover: "Answer those, and it builds the whole thing for you — a complete, diversified strategy for your $1,000 — and shows you how it would have performed on real past prices before you risk a cent."
- duration: 9.515s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/07-build-backtest.html
- type: feature_showcase
- persuasion: Show-don't-tell proof + statistical honesty — evidence with a label, no hype numbers
- beat: confidence → trust
- blueprint: grid-card-assemble → dataviz (chart-draw, NO count-up — no verified figures exist)
- focal: the rule-card stack, then the backtest chart
- roles: rule cards = cutout (hero 1) · chart card = cutout (hero 2) · Backtest Result pill + fine print = supporting · dark field = background
- sfx: pop, chime
- asset_candidates: none — hand-built strategy + chart recreation (capture gap; GUARDRAIL: no numeric values on the chart)

Two-act shot. GUARDRAILS bind: no tickers, no company names, no percentages, no dollar values on the chart (the "$1,000" in the VO is spoken only). The "Backtest Result" label is REQUIRED and visible whenever the chart is.
Scene 1 (0.0–3.4s): on "builds the whole thing," four labeled rule cards stagger-assemble in a vertical stack (center-outward short-path): "Entry rules", "Exit rules", "Position sizing", "Rebalancing" — each with a small green line icon and a generic sub-line ("Set by your answers"); a green tag-pill "DIVERSIFIED" pops beside the header "Your strategy".
Scene 2 (3.4–3.9s): the stack condenses/clears upward — and a 0.5s HOLD of near-empty dark (the grammar spec's pre-chart beat) builds anticipation.
Scene 3 (3.9–7.6s): on "how it would have performed," a dark chart card rises with the green "BACKTEST RESULT" tag-pill above it; a green equity curve DRAWS left→right (svg-path-draw) over faint gridlines with a gray dashed comparison line beneath — NO axis numbers, NO return figure, NO labels beyond "Backtest Result"; on "before you risk a cent," a muted caption "on real past prices" fades under the chart.
Scene 4 (7.6–9.0s): soft green glow blooms behind the chart; the fine-print disclaimer fades in small above the clear zone; held read.

narrativeRole: The payoff — build and proof in one unbroken sequence, honest to the guardrails: shape and label, no invented numbers.
keyMessage: It builds it, and shows you the evidence, before a cent is at risk.

## Frame 9 — Comment BUDDI

- scene: End card — "Comment" snaps in, a comment pill types "GROW", a green down arrow drops; sub-line "building + paper trading = free"; buddi wordmark; disclaimer fine print. Holds static the final 4–5s.
- voiceover: "Comment 'BUDDI' and I'll DM you the link — building it and paper-trading on real prices is totally free."
- duration: 4.757s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/08-comment-grow.html
- type: cta
- persuasion: Friction reduction — one typed word; "free" scoped to build + paper trade only
- beat: urgency-to-act
- blueprint: kinetic-type-beats (Reproduce — CTA variant)
- focal: the GROW comment pill
- roles: "Comment" h1 + GROW pill + arrow = cutout (hero stack) · wordmark + fine print = supporting · rings atmosphere = background
- sfx: impact-bass-1, pop
- asset_candidates: none — typography + comment pill, hand-built

Reproduce: the CTA snaps in beat-by-beat and locks static — the end card holds for the final ~4s per the grammar spec.
Scene 1 (0.0–1.0s): near-black with faint green concentric rings; near-white h1 "Comment" snaps in center.
Scene 2 (1.0–2.2s): comment pill pops beneath and "GROW" TYPES in with the green caret; a green down-arrow (inline SVG) drops under it.
Scene 3 (2.2–5.0s): on "totally free," the sub-line "building + paper trading on real prices = free" fades in muted; small "buddi" wordmark seats at the stack's foot; disclaimer fine print above the clear zone; end card locks DEAD STATIC to the final frame.

narrativeRole: CTA — one word, DM the link; "free" scoped exactly per guardrail 5.
keyMessage: Comment GROW, get the link, build and paper-trade free.
