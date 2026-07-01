# Stax — Facebook/Instagram Static Ad Concepts (Chat Builder)

Two curated static-image ad concepts for the Stax chat builder, built by reverse-engineering
what the AI labs (Anthropic, OpenAI, Perplexity, et al.) and top direct-response marketers
actually run — not by reinventing the wheel. Every creative choice below is tied to a pattern
that **survived adversarial verification** in the research pass (see *Evidence & Caveats*).

**Positioning north star:** Stax's chat builder *is* the ChatGPT/Claude interaction — plain-English
prompt in, useful output out — pointed at investing. So we borrow the AI-lab ad playbook wholesale
and swap the output from "an essay" to "a backtested strategy with real numbers."

---

## The verified playbook (what we're copying, and why)

| Principle | What the research confirmed | How we apply it |
|---|---|---|
| **Hook can be the visual itself** | The winning structure is hook → body → CTA, and the hook can live in the image/bold overlay, not just line 1 of copy. | Concept A's hook *is* the prompt-and-result screenshot. Concept B's hook is one giant sentence. |
| **Specificity beats adjectives** | Ogilvy's Rolls-Royce clock: concrete, measurable facts let the reader self-conclude. "Adding numbers to headlines" is a documented lift. | Real metrics on the creative: `+14.7% return · 0.25 Sharpe · 14.3% max DD · 53% win rate`, `181 symbols · 105 trades`. |
| **Lead with numbers** | Stats/percentages/dollar amounts catch the eye ("Cut costs 43% in 30 days"). | `$300k → $0`, `8 seconds`, `181 symbols`. |
| **Benefit-led CTAs beat generic labels** | "Get [product]" / "See the exact [thing]" >> "Sign Up" / "Learn More". | `Build your first strategy free →` and `Ask Stax anything →` — never "Sign Up". |
| **Curiosity gap / open loop** | Incomplete information creates tension that pulls the click. | Concept B withholds the "how" — you see the sentence and the payoff, not the mechanism. |
| **"Your AI [role]" positioning** | Leading AI brands sell a *thinking partner / role*, not a feature list (Anthropic's "Keep Thinking"). | Concept B: "Your new AI quant." |
| **Friction-reducer near the CTA** | [risk reversal] + [social proof] + [speed] under the button lifts action. | "free", "in seconds", and the disclaimer double as trust cues. Add a live user count when you have one. |

> **Reality check the research forced on us:** every *specific* "AI creative gets X% higher CTR/lower CPC"
> benchmark was **refuted** during verification (the "12% higher CTR / 50,000 variations" stat, the
> "$100 AOV threshold," the Advantage+ compounding claim — all killed). So: **don't trust a single
> published CTR/CPC number as gospel, and don't optimize for cheap clicks.** A 1% CTR that converts at
> 10% beats a 4% CTR that converts at 1%. We optimize for *qualified* clicks (people who want to build a
> strategy), which is why both CTAs describe the actual next action.

---

## Concept A — "Prompt → Payoff"  → `concept-a-prompt-to-payoff.html`

**The most-proven AI-ad format: show the product doing the thing.** Input on top, instant output below.
This is the "show, don't tell" UI-screenshot pattern the labs ride hardest, because the demo *is* the hook.

- **Visual:** A clean dark chat card. User prompt typed in → a "Stax is working…" beat → the answer: a
  rising equity curve + four stat chips. Feels like a real screenshot, not an ad.
- **Headline (on-image):** *Describe a strategy. Get the **backtest** in seconds.*
- **Sub:** *No code. No Bloomberg terminal. Just type what you want to own.*
- **CTA button:** *Build your first strategy free →*

**Meta primary text (caption):**
> You don't need to code. You don't need a Bloomberg terminal.
> Type what you want to invest in — in plain English — and Stax screens the market, builds the
> strategy, and backtests it against real history.
> 181 symbols screened. 105 trades. A full backtest, in the time it took to read this. 📈
> Build your first strategy free → staxlabs.org

**Headline variants to A/B test:**
1. *Describe a strategy. Get the backtest in seconds.* (control)
2. *Type it. Backtest it. In one sentence.*
3. *"High ROE, low debt, large caps" → a backtested strategy in seconds.* (literal prompt-as-headline)

**Why it wins:** hook-in-visual + maximum specificity + benefit CTA, all three verified levers stacked.

---

## Concept B — "Your AI Quant"  → `concept-b-your-ai-quant.html`

**The bold-typography-on-solid-background format** (Anthropic/Perplexity house style) fused with
**"your AI [role]" positioning** and a **numeric price-anchor hook**.

- **Visual:** Near-black canvas, subtle brand glow, one massive sentence. A single faux input line at the
  bottom is the only "UI" — a show-don't-tell wink.
- **Kicker:** *Your new AI quant*
- **Hero:** *Hire a quant for ~~$300k~~ **$0.** Answers in 8 seconds.*
- **Sub:** *Type one plain-English sentence. Stax screens the market, builds the strategy, and backtests it against real history.*
- **CTA button:** *Ask Stax anything →*

**Meta primary text (caption):**
> A quant analyst costs six figures and takes weeks.
> Stax takes a sentence.
> "Dividend payers, low debt, cheaper than the market" → a screened, backtested strategy, in seconds.
> Meet your AI quant. Ask it anything → staxlabs.org

**Headline variants to A/B test:**
1. *Hire a quant for $0. Answers in 8 seconds.* (control — price anchor + speed)
2. *Your new AI quant doesn't sleep, doesn't charge $300k, and answers in seconds.*
3. *The quant desk of a hedge fund. In one sentence.* (curiosity/status)

**Why it wins:** thumb-stopping contrast + role positioning + the price-anchor curiosity gap. This is the
"cheap CPM, high thumb-stop" creative that balances Concept A's higher-intent demo.

---

## How to run them (paid-media plan)

- **Test as a pair, not a favorite.** A (product demo, higher intent) vs. B (bold hook, cheaper reach).
  Same audience, same budget, let CTR **and** downstream sign-up rate decide — not CTR alone.
- **1:1 (1080×1080) is the primary crop** for feed. Also export 4:5 (1080×1350) for feed real estate and
  9:16 (1080×1920) for Stories/Reels — same layout, just re-stacked.
- **Judge on cost-per-qualified-action** (strategy built / sign-up), not cost-per-click. The research is
  blunt: cheap clicks can tank ROAS.
- **Rotate the prompt text** as cheap creative variants — each different plain-English request
  ("dividend compounders," "small-cap deep value," "AI chip momentum") is a fresh ad for near-zero cost.

## ⚠️ Compliance — do this before you spend a dollar

Finance/investment ads are a **restricted category** on Meta (allowed, but scrutinized). The research pass
could **not** verify specific current Meta finance-ad rules, so treat this as a flag, not gospel — **have
someone confirm against Meta's "Financial Products & Services" ad policy before launch.** Working guardrails
baked into both creatives:

- **No guaranteed / promised returns, no "get rich" framing.** Numbers are shown as *backtested historical
  output*, never a forecast.
- **Disclaimer on every creative:** "Backtested on historical data. Not investment advice. Past performance
  doesn't guarantee future results." (Present in both mockups.)
- Avoid implying personalized financial advice; Stax is a **research/backtesting tool.**

## Notes / knobs for you

- **Brand colors are placeholders** (dark canvas + gains-green `#12E29A`). Swap to Stax's real palette.
- **Numbers are the README's real example** (`+14.7%`, `0.25 Sharpe`, etc.) — defensible and specific. If
  you have a stronger *real* backtest, use it; don't inflate.
- **"$300k" and "8 seconds"** in Concept B are anchors — set them to numbers you can defend.
- Assumed audience: **retail investors/traders on the consumer web app.** If you're actually targeting the
  Claude Code / Codex developer crowd for the CLI skill, the copy re-aims (say the word).
