# ENGINE_GRAMMAR — HiveField

<GrapplerHook>
engine: HiveField
version: 1.0.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: pending
premium: false
</GrapplerHook>

## Engine Identity
- **Name:** HiveField
- **Domain:** hivefield.hive.baby
- **Repo:** saggarsonny-boop/hive-field
- **Status:** Live
- **Stack:** Next.js + TypeScript + Anthropic SDK (claude-opus-4-5)

## Purpose
Multi-step branching scenario engine for professional training. User inputs their profession and role; the engine generates a realistic, high-stakes scenario, then coaches on the decisions made across the full arc. Works for any profession — medicine, law, teaching, engineering, emergency services, military, finance.

## Inputs
- Free-text profession + role (e.g. "ICU nurse, night shift")
- Sequential decision responses during the scenario
- Reflection input at scenario end

## Outputs
- Opening scenario: vivid, specific, time-pressured
- Decision branches: consequence-driven, escalating stakes
- Arc evaluation: honest coaching on the full decision sequence
- Structured: situation → decisions → coaching → lesson

## Modes
- **Standard:** Single scenario, free-text profession, branching decisions, final coaching
- **Replay:** User can restart the same scenario to try different decisions

## Reasoning Steps
1. Parse profession and seniority signals from free-text input
2. Generate scenario at appropriate level of complexity and stakes
3. At each decision point: evaluate choice, advance scenario accordingly
4. At arc end: review full decision chain, surface patterns, deliver coaching
5. Never moralize — coach as a senior colleague would

## Safety Templates
- No simulated patient deaths presented graphically
- Medical scenarios include: "This is a training simulation. Always follow your institution's protocols."
- Legal/police scenarios: "This is a training simulation. Always follow your jurisdiction's procedures."
- No scenario generates advice intended for real emergencies

## Multilingual Ribbon
- Status: pending
- Target: auto-detect input language, respond in same language
- MLLR integration: post-QB deployment

## Premium Locks
- None currently. Future Pro: save scenario history, replay analytics, team mode.

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (pending full QB deployment)
- Safety level: standard
- Output schema: scenario-response
- Tone: neutral

## API Model Strings
- Primary: `claude-opus-4-5`
- Fallback: none

## Deployment Notes
- Vercel: auto-deploy on push to main
- Domain: hivefield.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Deployment Protection: OFF
- ANTHROPIC_API_KEY: set in Vercel Production env vars
