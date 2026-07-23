# Meta Pixel & Conversions API Audit — Stax Labs

**Date:** 2026-07-23 · **Auditor:** Claude (full codebase read of `stax-app/stax` @ `polish`, commit `b8834b1`)
**Trigger:** Pedro confirmed misleading Lead numbers in Ads Manager; ad structure was just rebuilt (5 ad sets, optimizing for registrations instead of leads, target CPA < $15).

---

## Executive summary

The pixel infrastructure itself is well-built (centralized tracker, event queue, geo-gating, server-side CAPI with hashed emails and fbp/fbc capture, no stray `fbq()` calls). But **the conversion events feeding Meta are wrong in ways that corrupt every number in Ads Manager**, and one gap directly undermines the new ad structure:

1. **Google OAuth signups fire NO pixel event at all.** The new campaigns optimize for CompleteRegistration, but the recommended signup path is invisible to Meta.
2. **Email signups are double-counted.** Browser pixel + server CAPI fire the same conversion without a shared `event_id`, so Meta cannot deduplicate them.
3. **"Lead" means five different things**, including one that fires before an account even exists.

Until items 1–2 are fixed, registration CPA in Ads Manager is wrong in *both directions at once* (double-counting deflates it; missing OAuth signups inflate it). The 5-ad-set restructure cannot be fairly judged on current data.

---

## How the pixel touches the app (the map)

| Layer | File | Role |
|---|---|---|
| Script loader | `frontend/src/components/analytics/MetaPixel.tsx` | Injects `fbevents.js`, `fbq('init')` after first-usable. Pixel ID from `NEXT_PUBLIC_META_PIXEL_ID` (1152314599580604 per March meeting doc). |
| Route PageViews | `frontend/src/components/analytics/MetaPixelRouterEvents.tsx` | PageView on every pathname/`?view=` change + ViewContent for stocks/portfolio/news/learn/labs views. |
| SPA PageViews | `frontend/src/contexts/labs/NavigationContext.tsx:155-170` | Also fires PageView + ViewContent on every Labs view change. |
| Central tracker | `frontend/src/lib/analytics/trackMetaPixelEvent.ts` | Queueing until fbq loads, event_id dedup, geo-gate, zero-value trial-purchase suppression. |
| Geo-gating | `frontend/src/lib/analytics/geoDetection.ts` + `frontend/middleware.ts:228-236` | Blocks EU/EEA/UK/CH via `user-region` cookie (CF-IPCountry). Unknown region falls back to **allow**. |
| Server-side CAPI | `frontend/src/lib/analytics/metaCapiBridge.ts` → `supabase/functions/meta-capi/index.ts` | Sends Purchase/Subscribe/InitiateCheckout/Lead/CompleteRegistration to Graph API v21.0 with SHA-256 email, fbp/fbc, client IP. |
| Attribution | `frontend/src/components/analytics/AttributionCapture.tsx` | First-touch attribution → stored on user at signup (internal, not pixel). |

### Every conversion event emitter (code truth, not docs)

| Meta event | Fires when | Where | event_id shared w/ CAPI? |
|---|---|---|---|
| `CompleteRegistration` | Email signup completes (Labs) | `app/labs/signup/page.tsx:142` | ❌ none on either call |
| `CompleteRegistration` | Email signup (main-app form) | `hooks/useAuthForm.ts:118` | ❌ none |
| `CompleteRegistration` | **Google OAuth signup** | — **MISSING** (`app/labs/callback/page.tsx` fires zero pixel events) | — |
| `Lead` | Waitlist join | `services/labs/waitlist/WaitlistService.ts:232` | ❌ none |
| `Lead` | Referral code applied at signup | `app/labs/signup/page.tsx:178` | ❌ none |
| `Lead` | Verification email sent (pre-account!) | `app/labs/signup/page.tsx:456` | ❌ none |
| `Lead` | Main-app onboarding complete | `services/supabase/OnboardingService.ts:1202` | no CAPI at all |
| `Lead` | Free tier chosen after quiz | `app/labs/components/onboarding-quiz/useOnboardingQuiz.ts:485` | ✅ correct |
| `Subscribe` | **Every login** (marketing-consented) | `hooks/useAuthForm.ts:97` | pixel only |
| `Subscribe`+`Purchase` | Stripe subscription success | `app/labs/home/page.tsx:516-535` | ✅ but same id reused across 3 event names |
| `InitiateCheckout` | Tier upgrade checkout | `services/labs/billing/LabsBillingService.ts:991` | ✅ |
| `InitiateCheckout` | FinBucks checkout | `components/labs/BuyFinBucksModal.tsx:120` | no CAPI call |
| `Purchase` | FinBucks success | `components/labs/FinBucksSuccessModal.tsx:73` | ✅ (no email passed) |
| `ViewContent`/`AddToCart`/`InitiateCheckout`/`Purchase` | Paywall/upsell modal impressions & clicks | `hooks/conversion/useConversionTracking.ts:243-264` (used by 5 conversion components) | pixel only |
| `CustomizeProduct` | Strategy deployed | `useDeployModalState.ts:750,834` | pixel only |

---

## Findings, ranked

### P0-1 — Google OAuth signups are invisible to Meta (breaks the new ad structure)

`app/labs/callback/page.tsx` performs the complete OAuth registration — profile reconcile, Labs access grant, even referral redemption (`:340`) — and fires **only internal analytics** (`trackLaunch`). No `CompleteRegistration`, no `Lead` for OAuth referrals, no CAPI. The signup page labels Google OAuth "recommended," so this is likely the **majority** signup path.

**Impact on the campaigns launched today:** ad sets optimizing for registrations only receive signal from email-form signups. Meta's algorithm learns from a skewed minority, reported CPA is inflated, and low conversion volume keeps ad sets stuck in learning phase. This is the single biggest reason the pixel data cannot be trusted right now.

### P0-2 — Browser + CAPI double-counting on Lead and CompleteRegistration

Meta deduplicates a browser-pixel event against a CAPI event only when both share the same `event_id` (and event name). Five emitter pairs send **no event_id on either side**: `signup/page.tsx:142/146`, `:178/182`, `:456/461`, `useAuthForm.ts:118/122`, `WaitlistService.ts:232/236`.

**Impact:** each email signup ≈ 2 CompleteRegistrations; each waitlist join or referral ≈ 2 Leads (whenever the browser pixel isn't ad-blocked). This is almost certainly one of Pedro's "two reasons the lead numbers are misleading."

### P0-3 — "Lead" is five different things, one of which precedes account creation

Waitlist join, referral signup, *verification-email-sent*, main-app onboarding completion, and free-tier quiz choice all fire `Lead`. The `email_verification_sent` variant (`signup/page.tsx:456`) fires **before the account exists** — people who abandon the 6-digit code still count as Leads. A referral email-signup can plausibly fire Lead (verification) + CompleteRegistration + Lead (referral) + Lead (free_after_quiz) — up to 4 conversions, several double-counted via CAPI — for one human. This is the other likely "reason two."

### P1-4 — `Subscribe` fires on every login

`useAuthForm.ts:97` fires the standard `Subscribe` conversion whenever a consented user *logs in* — including the Labs `LoginDropdown`. A daily active user generates a stream of fake subscription conversions, polluting audiences and any value optimization.

### P1-5 — Browser `Purchase` is silently dropped on subscription success

`LabsBillingService.ts:974` mints one `event_id` and reuses it for InitiateCheckout, then (after Stripe redirect) `home/page.tsx:516-530` reuses it for both Subscribe and Purchase. The local dedup in `trackMetaPixelEvent.ts:186` keys on `event_id` alone — so the second same-session call (**Purchase**) is swallowed client-side. Purchase reaches Meta only via CAPI; and the CAPI edge function returns HTTP 200 even when its secrets are missing (`meta-capi/index.ts:111-118`), so if that config ever breaks, subscription Purchases vanish with zero alarms.

**Fix shape:** dedup key = `${eventName}:${eventId}`; mint a distinct event_id per event name.

### P1-6 — Paywall/upsell touchpoints flood standard commerce events

`useConversionTracking.ts` maps modal impressions → `ViewContent`, CTA clicks → `AddToCart`, upgrade clicks → `InitiateCheckout`, `conversion_complete` → `Purchase`, across DualPathPaywallModal, banners, BacktestCelebrationModal, etc. This explains the mystery "AddToCart" volume Adam saw in Events Manager and contaminates mid-funnel signals ads rely on. These should be **custom events**, not standard commerce events.

### P2-7 — Every Labs view change fires PageView + ViewContent twice

`NavigationContext.trackLabsViewChange` fires both directly, then its `router.push('/labs/home?view=…')` (`:343,388,422`) triggers `MetaPixelRouterEvents` to fire the same pair again. Doubles PageView/ViewContent volume inside Labs (noise, not conversions — but it skews engagement-based audiences).

### P2 — Smaller items

- FinBucks: no CAPI on InitiateCheckout; Purchase CAPI sends no email (weaker match quality).
- `OnboardingService.ts:1202` Lead is a legacy main-app (Stax 1) path — no event_id, no CAPI; retire or align it.
- CAPI edge function's silent-200-on-misconfig deserves at least a log-based alert.
- Geo fallback is `allow` when region is unknown — fine for US-focused ads, just be aware.

### What's healthy ✅

Single entry point (`trackMetaPixelEvent`) with no rogue `fbq()` calls anywhere; event queue prevents pre-load loss; EU/UK/CH geo-gating; zero-value trial purchases suppressed on both pixel and CAPI; CAPI enriches with client IP + hashed email + fbp/fbc; quiz free-tier Lead and tier-upgrade InitiateCheckout are instrumented exactly right — they're the template the rest should follow.

---

## What this means for the 5-ad-set decision

Today's restructure optimizes for **CompleteRegistration** with a sub-$15 target. Current instrumentation reports registrations that are simultaneously **undercounted** (all OAuth signups missing) and **double-counted** (email signups, browser+CAPI). The two errors do not cancel — they distort per-ad-set attribution unpredictably, which is exactly the data the algorithm and your ad-set comparisons run on. Recommendation: fix P0-1/P0-2/P0-3 immediately, then let the new structure run ~7 days on clean data before judging it or debating placements.

## Recommended fix plan (small, sequenced, low-risk)

1. **OAuth registration event** — in `labs/callback/page.tsx`, after successful registration and only when the account is newly created (the `isReturningUser`/reconcile-`created` guard the REGISTER-CAPTURE-01 doc already prescribes), fire `CompleteRegistration` + CAPI with one shared `event_id` and the user's email.
2. **Shared event_ids** — add `crypto.randomUUID()` to the five unpaired pixel/CAPI pairs (P0-2), copying the quiz free-tier pattern.
3. **Un-overload Lead** — keep `Lead` = waitlist only (or retire it); move `email_verification_sent` to a custom event; referral signup becomes custom (`ReferralSignup`) or a param on CompleteRegistration.
4. **Kill Subscribe-on-login** — replace with a custom `LoginSuccess` event or delete.
5. **Dedup key fix** — `${name}:${eventId}` in `trackMetaPixelEvent.ts`; distinct ids for InitiateCheckout/Subscribe/Purchase.
6. **Remap touchpoint events** to `Conversion_*` custom events (they already have that fallback format).
7. **De-dupe Labs PageView** — let `MetaPixelRouterEvents` be the single PageView source; strip the direct calls from `NavigationContext`.
8. **Verify after deploy** with Meta Pixel Helper + Events Manager Test Events: one and only one CompleteRegistration per signup (both email and Google paths), Dedupe column showing browser/server pairs merging.

---

## Implementation status (2026-07-23, same day)

All 8 fixes implemented on branch `claude/meta-api-pixel-integration-hrm1zn` of `stax-app/stax`:

| # | Fix | Where |
|---|---|---|
| 1 | CompleteRegistration + CAPI now fire for OAuth **and** emailed-link signups, new accounts only (`isNewAcquisition` guard), deterministic `signup-<user.id>` event_id so any double path dedups at Meta | `app/labs/callback/page.tsx` |
| 2 | Shared event_ids added to every browser+CAPI pair (signup page, auth form, waitlist) | 3 files |
| 3 | Lead = waitlist only. `email_verification_sent` → custom `EmailVerificationSent`; referral → custom `ReferralSignup`; onboarding → custom `OnboardingComplete`; quiz free tier → custom `FreeTierSelected` | 4 files |
| 4 | Subscribe-on-login removed | `hooks/useAuthForm.ts` |
| 5 | Local dedup now keyed `${event}:${id}`; Subscribe/Purchase get distinct derived ids — browser Purchase no longer swallowed | `trackMetaPixelEvent.ts`, `labs/home/page.tsx` |
| 6 | Paywall touchpoints now emit only custom `Conversion_*` events (no more fake ViewContent/AddToCart/InitiateCheckout/Purchase) | `useConversionTracking.ts` |
| 7 | Labs SPA PageView single-sourced to `MetaPixelRouterEvents` | `NavigationContext.tsx` |
| + | Custom events sent via `fbq('trackCustom')`; FinBucks gained CAPI InitiateCheckout + email on Purchase CAPI | 3 files |

Verification: 28 analytics test suites (168 tests) pass; ESLint clean of new issues (5 pre-existing errors unrelated to these edits); SignupForm test failures confirmed pre-existing on pristine `polish`.

**Post-deploy checklist (human, in Events Manager):**
1. Test Events: one CompleteRegistration per signup via Google *and* via email; Dedupe column shows browser/server merging.
2. Confirm the ad sets' conversion event is CompleteRegistration (it will now include OAuth volume — expect reported registrations to RISE and CPA to DROP; that's the fix, not a fluke).
3. Legacy custom conversions built on Lead/AddToCart/Subscribe should be reviewed — their meanings changed (Lead = waitlist only now).
4. Verify `META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` are set in Supabase Edge Function secrets (the function fails silently without them).
