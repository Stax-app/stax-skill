---
format: 1080x1920
message: "You don't need an investing idea — Buddi builds a real, backtested strategy from a few questions, and you can paper-trade it free."
arc: PAS with demo loop — hook → pain → product intro → demo (build) → proof (backtest) → risk reversal → CTA
audience: "Grower — money sitting in cash, no idea where to start"
mode: autonomous
music: minimal upbeat tech — light percussive pulse, curious and clean, no drop
---

## Video direction

- **Palette system** (from `frame.md`, never invented): warm cream `bg` ground on every frame; single cobalt `primary` carries every accent — eyebrows, selected chips, chart stroke, toggles, the one solid CTA pill. Headlines near-black `text`; body/muted `text-muted`; tinted cards (4% cobalt fill, 20% cobalt 1.5px border, 10–14px radius, NO shadow). The Buddi chat UI is built from these same tokens — user bubbles are the solid cobalt, Buddi bubbles are tinted cards. Positive/negative colors inline-only.
- **Motion grammar + reveal model**: smooth long-tail settles (`power3` default) — no bounce, no overshoot except the single sanctioned spring-pop payoff per frame. Every frame reveals each piece on its spoken cue, spreading reveals across the back ~50%; nothing enters before the VO names it. During holds: stillness, at most subtle jitter (`sine-wave-loop`, low amplitude) — no breathing, no back-half pan/push.
- **Rhythm / held frames**: Frame 2's ending is a DELIBERATE dead-still hold — the motionless bank card IS the pain. Frame 5 ends on a held read after the curve resolves (let the evidence breathe before the risk-reversal beat). All other frames stay VO-paced.
- **UGC screen-record register**: the "device" is implied, not drawn — no phone bezel, no browser chrome, no fake status bar. Chat surfaces, chips, toggles float directly on cream as tinted cards. Interactions read as thumb taps: a soft circular tap-highlight (cursor-click-ripple, finger-sized) rather than an arrow cursor.
- **Caption band**: all content composed into the top ~83%; the bottom band stays clear for the caption pill. The backtest disclaimer fine print sits just above that boundary.
- **Negative list**: no slideshow front-loading (nothing dumped in the first 25%); no screensaver drift (nothing floats independently); no `back.out`/`bounce.out`; no second accent color; no cobalt headlines; no shadows on cards; no invented numerals — every figure traces to the script ($1,000, three questions) or renders as a structural element instead of a number; no phone bezels or browser chrome; atmosphere (concentric rings) on the closing frame only.

## Frame 1 — The no-clue sentence

- scene: A thumb types "I have $1,000 and no clue what to do with it" live into a clean Buddi chat input — caret blinking, words appearing keystroke by keystroke. No face, no logo yet.
- voiceover: "I had $1,000 sitting in cash — and no clue what to do with it. So I typed that exact sentence into an AI."
- duration: 9.408s
- transition_in: cut
- status: animated
- src: compositions/frames/01-no-clue-sentence.html
- type: hook
- persuasion: Pain validation — the viewer's own unspoken sentence, typed out loud
- beat: curiosity + recognition
- blueprint: typewriter-reveal (Reproduce — Hook variant, ticker-push sub-variant)
- focal: the typed sentence in its chat-input pill
- roles: chat-input pill = cutout (hero) · send button = supporting · cream field = background
- sfx: typing, pop
- asset_candidates: none — hand-built chat-UI recreation (see asset-descriptions.md; no captured assets exist)

Reproduce: keep the signature — live type-on with trailing caret, assembly ticker-translates so the caret stays near center; resolve is adapted from collapse→brand-pop to send→sent-bubble (the product UI sub-variant: the payoff is the message entering the chat, not a logo — no logo yet per story).
Scene 1 (0.0–2.4s): cream field, empty except one rounded chat-input pill (tinted card, pill radius) parked center at ~80cqw wide, upper-middle; a blinking caret (context-sensitive-cursor) sits at line start, then "I have $1,000 and no clue what to do with it" TYPES character-by-character (discrete-text-sequence) as the VO speaks the same thought; the assembly translates gently leftward so the active caret stays near frame-center (camera-cursor-tracking). Centered, hero pill ≥ 50% of width, 2 depth layers (field + pill).
Scene 2 (2.4–3.3s): on "typed that exact sentence" — a finger-sized tap-highlight lands on the cobalt send button (cursor-click-ripple), the button compresses and springs (press-release-spring), and the input pill lifts up and morphs into a SENT cobalt chat bubble seating upper-right (card-morph-anchor) — the everyday thought becomes a message to an AI.
Scene 3 (3.3–4.0s): hold on the sent bubble; a Buddi typing-indicator (three dots, finite staggered pulses — dynamic-content-sequencing, no loop) fades in lower-left where a reply would arrive: the cliffhanger into Frame 3's world. Still otherwise.

narrativeRole: Hook — opens on the viewer's exact private thought being typed, so the viewer is the protagonist from second one. The "typed that exact sentence into an AI" turn creates the itch the rest of the video scratches.
keyMessage: Your "no clue" sentence is a valid starting input.

## Frame 2 — Just… sitting there

- scene: A deliberately boring bank-balance card — "$1,000.00 · Savings · 0 activity" — sits dead still on the canvas while short pain statements land around it. On-screen text: "just… sitting there 💤"
- voiceover: "That's most of us, right? You want your money to grow — but 'where do I even start' freezes you. So it just sits there."
- duration: 6.976s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-sitting-there.html
- type: pain_point
- persuasion: Pain agitation — naming the freeze, not the ignorance; the stillness of the card IS the pain
- beat: recognition → mild frustration
- blueprint: kinetic-type-beats (Adapt — Problem variant)
- focal: the frozen "where do I even start" line
- roles: bank-balance card = supporting (the still-life prop) · pain lines = cutout (hero type) · cream field = background
- sfx: impact-bass-2
- asset_candidates: none — hand-built bank-balance card recreation

Adapt: keep the signature — pain lines land one at a time, each alone on its beat, replacing in place; change — a static bank-balance card sits above as the visual anchor the type plays against (not a bare canvas), and the resolve is a deliberate dead-still hold instead of a swipe reveal.
Scene 1 (0.0–1.6s): crossfade lands on a boring bank card (tinted card): "Savings — $1,000.00 — No activity this year", parked upper-third, dead still; beneath it "That's most of us, right?" reveals per-word (dynamic-content-sequencing) as the VO says it. Rule-of-thirds, card ~55cqw wide, 2 depth layers, type is the dominant weight.
Scene 2 (1.6–3.6s): on "you want your money to grow" the line HARD-CUTS to "you want it to grow" with a cobalt drawn underline sweeping under "grow" (css-marker-patterns); then on the VO's quoted freeze, it hard-cuts again (discrete-text-sequence) to "where do I even start" in quote marks — and the underline drains away: the type itself freezes mid-gesture.
Scene 3 (3.6–6.0s): on "so it just sits there" the pain line clears and the muted tag "just… sitting there 💤" fades up small under the card (discrete-text-sequence); then EVERYTHING holds dead still to the end — no jitter, no drift; the held read is the message. The card never moved once in six seconds.

narrativeRole: Problem — universalizes the hook ("that's most of us") and names the real blocker: not laziness, paralysis. Sets up "no idea needed" as the exact antidote.
keyMessage: The problem isn't your money — it's that "where do I start" freezes you.

## Frame 3 — It just asks you questions

- scene: Back in the Buddi chat — Buddi replies, then three simple multiple-choice question chips appear one by one; a thumb taps an answer on each. The product is DOING the thinking on screen.
- voiceover: "Turns out there's now an AI built for your money. And you don't even need an idea — if you don't have one, it just asks you a few simple questions."
- duration: 9.344s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/03-asks-questions.html
- type: product_intro
- persuasion: Friction reduction — the scary "idea" requirement is visibly replaced by tappable multiple-choice
- beat: relief + intrigue
- blueprint: cursor-ui-demo (Adapt — Product_Intro variant, thumb-tap actor)
- focal: the three question chips being answered
- roles: Buddi chat column = cutout (the surface is the hero) · tap-highlight = supporting (the actor) · cream field = background
- sfx: click-soft, click
- asset_candidates: none — hand-built Buddi chat + question-chip recreation

Adapt: keep the signature — the camera servos to each interaction and the UI answers live; change — the actor is a finger-sized tap-highlight (no arrow cursor), and the surface is a bezel-less chat column on cream.
Scene 1 (0.0–2.6s): zoom-through arrives inside the chat; the sent bubble from Frame 1 sits top; as the VO says "an AI built for your money," a Buddi reply bubble (tinted card) types on beneath it (discrete-text-sequence): "I can build this for you. Three quick questions first." — the name pill "buddi" appears small above the bubble: first, quiet brand reveal. Asymmetric chat column ~78cqw, 3 depth layers (field, bubbles, name pill).
Scene 2 (2.6–6.2s): on "it just asks you a few simple questions," question card 1 slides up (spring-pop-entrance, smooth settle): "What's the goal?" with three choice chips — the tap-highlight lands on "Grow it steadily" (cursor-click-ripple + press-release-spring), chip fills cobalt; camera pans down (viewport-change, camera servo) to question 2 "How long can it sit?" → tap "3+ years"; pan to question 3 "How much risk feels okay?" → tap "Moderate". Each Q reveals only on its beat — one interaction per beat, camera chasing (camera-cursor-tracking).
Scene 3 (6.2–8.0s): the three answered chips condense into a compact stack of cobalt-tinted summary pills with drawn check marks (svg-path-draw); camera settles wider and holds — three taps, done. Still hold.

narrativeRole: Product intro — lands the message ("no idea needed") by beat 3 and proves it in the same breath: the questions are so simple a thumb answers them in seconds.
keyMessage: No idea needed — Buddi asks, you tap.

## Frame 4 — It built the whole thing

- scene: The moment of magic — labeled strategy rule cards (Entry rule, Exit rule, Position size, Rebalance) self-assemble into a stack titled "Your strategy", each snapping into place as the VO names it.
- voiceover: "Here's the part that got me — I answered like three, and it built the whole thing. A real, rules-based strategy."
- duration: 6.912s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/04-built-the-thing.html
- type: feature_showcase
- persuasion: Show-don't-tell proof — the abstract "it built it" claim becomes four concrete, readable rules
- beat: surprise → confidence
- blueprint: grid-card-assemble (Reproduce — Key_Feature grid variant, vertical stack for 9:16)
- focal: the four rule cards assembling
- roles: rule cards = cutout (hero array) · header + eyebrow = supporting · cream field = background
- sfx: pop, riser
- asset_candidates: none — hand-built strategy rule-card recreation

Reproduce: keep the signature — staggered cascade into the final layout, then a near-static hold with slow push-in; 9:16 makes it a vertical 1-col stack (per frame.md aspect table).
Scene 1 (0.0–1.8s): push-slide lands a slide-header: cobalt eyebrow "BUILT FROM 3 ANSWERS" + near-black h3 "Your strategy" upper-third (dynamic-content-sequencing fills it line-by-line) while the VO sets up "here's the part that got me — I answered like three". Left-anchored header, generous silence below — the empty space is about to be filled.
Scene 2 (1.8–4.4s): on "it built the whole thing," four labeled rule cards stagger-assemble (center-outward-expansion, short-path into-slot form) into a vertical stack — "Entry rule", "Exit rule", "Position size", "Rebalance" — each a tinted card with a small line icon and a one-line rule summary; ~0.5s apart, each landing on a smooth long-tail settle. Stack ~80cqw wide, 3 depth layers.
Scene 3 (4.4–6.0s): on "a real, rules-based strategy," a cobalt tag-pill "RULES-BASED" spring-pops (spring-pop-entrance — the frame's one sanctioned pop) beside the header; a slow camera push-in (multi-phase-camera, steady-push) starts and settles; hold.

narrativeRole: Demo payoff 1 — converts three taps into a tangible artifact. "Rules-based" on screen kills the black-box fear without saying it.
keyMessage: Three answers in, a real strategy out.

## Frame 5 — Backtest result

- scene: A results chart draws itself across the frame — an equity curve on actual past prices — under a required "BACKTEST RESULT" label; the curve and label are the hero (no invented figure). Fine-print line: "Backtests are hypothetical — past performance doesn't guarantee future results."
- voiceover: "Then it showed me how it would have performed on actual past prices."
- duration: 4.053s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-backtest-result.html
- type: feature_showcase
- persuasion: Statistical proof — evidence on real historical data, honestly labeled
- beat: trust
- blueprint: dataviz-countup (Adapt — chart-draw hero, no invented count-up)
- focal: the equity-curve chart card under the BACKTEST RESULT label
- roles: chart card = cutout (hero) · BACKTEST RESULT tag-pill = supporting · disclaimer fine print = supporting · cream field = background
- sfx: riser, chime
- asset_candidates: none — hand-built backtest chart (SVG equity curve; no numeric figure — per frame.md numerals rule the return figure is not invented, the drawn curve + label carry the beat)

Adapt: keep the signature — a data instrument is the hero, resolved by an accent glow bloom; change — the count-up number is OMITTED (frame.md hard rule: never invent figures; the script requires a real verified figure that doesn't exist yet), so the left→right curve draw is the entire argument. The "$1,000 · start" marker is script-sourced and allowed.
Scene 1 (0.0–1.2s): push-slide lands the cobalt tag-pill "BACKTEST RESULT" top-center (spring-pop-entrance, smooth settle) with a large empty chart card beneath (tinted card, faint gridlines) — the stage is set but the evidence hasn't arrived. Centered, card ~84cqw wide × tall, 2 depth layers.
Scene 2 (1.2–3.4s): as the VO says "how it would have performed," the equity curve DRAWS left→right (svg-path-draw) in cobalt stroke with a translucent cobalt area fill beneath it, over faint gridlines; a small "$1,000 · start" marker chip sits at the curve's origin, and a cobalt end-dot lands where the draw finishes (spring-pop-entrance, small); on "actual past prices" the muted axis caption "actual past prices" fades in under the chart (discrete-text-sequence).
Scene 3 (3.4–5.0s): a soft cobalt glow blooms behind the chart card (ambient-glow-bloom); the disclaimer fine print "Backtests are hypothetical — past performance doesn't guarantee future results." fades up small and muted just above the caption band; held read to the end.

narrativeRole: Proof — the strategy isn't a guess; it's tested against reality before any money moves. The required "BACKTEST RESULT" label + disclaimer keep the claim honest.
keyMessage: It shows you the evidence before you commit.

## Frame 6 — Free before a single dollar

- scene: A "Paper Trade" toggle flips ON under the thumb; a "$0 to try" price tag lands beside it. On-screen text: "paper trade = free, real prices"
- voiceover: "And I could paper-trade it on real prices — free — before risking a single dollar."
- duration: 5.12s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/06-paper-trade.html
- type: benefit_highlight
- persuasion: Risk reversal — every remaining objection (cost, risk) removed in one beat
- beat: peace of mind
- blueprint: cursor-ui-demo (Adapt — single-interaction payoff press)
- focal: the Paper Trade toggle flipping ON
- roles: toggle card = cutout (hero) · $0 tag-pill = supporting · sub-line = supporting · cream field = background
- sfx: click
- asset_candidates: none — hand-built paper-trade toggle recreation

Adapt: keep the signature — the click IS the climax (workflow-approve-press flavor: one press as the payoff, UI answers live); change — a single toggle interaction, no multi-beat workflow, no camera chase.
Scene 1 (0.0–1.6s): push-slide lands one settings-row card center: "Paper Trading" label + a pill toggle in the OFF state, plus a muted sub-note "real market prices" (dynamic-content-sequencing reveals the row as the VO says "paper-trade it on real prices"). Centered, card ~78cqw, generous silence.
Scene 2 (1.6–3.0s): on "— free —" the tap-highlight lands on the toggle (cursor-click-ripple); it compresses and flips ON (press-release-spring), the pill filling cobalt as the knob slides; in the same beat a "$0 to try" tag-pill spring-pops beside the card (spring-pop-entrance — the frame's one pop).
Scene 3 (3.0–5.0s): on "before risking a single dollar," the tag line "paper trade = free, real prices" fades up beneath the card (discrete-text-sequence), muted; everything settles and holds still.

narrativeRole: Risk reversal — the last wall between "interesting" and "I'll try it" comes down: free, real prices, zero dollars at risk.
keyMessage: Try it free on real prices before risking anything.

## Frame 7 — Comment BUDDI

- scene: The CTA snaps in beat by beat — "Comment" then a comment-pill with "BUDDI" then a big 👇 — resolving into a clean lockup with the buddi wordmark. Fine print: "Backtests are hypothetical — past performance doesn't guarantee future results."
- voiceover: "Comment 'BUDDI' and I'll DM you the link to try it free."
- duration: 3.797s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/07-comment-buddi.html
- type: cta
- persuasion: Friction reduction — the ask is one typed word, not a signup
- beat: urgency-to-act
- blueprint: kinetic-type-beats (Reproduce — CTA variant)
- focal: the BUDDI comment pill
- roles: "Comment" h1 + BUDDI pill + 👇 = cutout (hero stack) · buddi wordmark + fine print = supporting · rings atmosphere = background
- sfx: impact-bass-1, pop
- asset_candidates: none — typography + comment-pill, hand-built

Reproduce: keep the signature — the closing line snaps in beat-by-beat and lands on a locked end-card; the closing frame carries the design system's rings atmosphere (allowed on closing only).
Scene 1 (0.0–1.1s): zoom-through resolves on cream with faint concentric rings centered; near-black h1 "Comment" snaps in dead-center (kinetic-beat-slam, one beat) as the VO says it.
Scene 2 (1.1–2.4s): on "BUDDI," a chat-input-style pill pops beneath the h1 (spring-pop-entrance) and "BUDDI" TYPES into it with a caret (discrete-text-sequence) — echoing Frame 1's typed sentence: you typed a sentence, now type one word; a large 👇 drops in under the pill on a smooth settle.
Scene 3 (2.4–4.0s): on "the link to try it free," the sub-line "free to try · link in your DMs" fades up muted beneath (discrete-text-sequence), the small "buddi" wordmark seats at the bottom of the stack, and the disclaimer fine print holds just above the caption band; end-card locks dead static to the final frame.

narrativeRole: CTA — one-word action matched to the platform (comment → DM). Ends the loop the hook opened: you typed a sentence, now type one word.
keyMessage: Comment BUDDI, get the link, try it free.
