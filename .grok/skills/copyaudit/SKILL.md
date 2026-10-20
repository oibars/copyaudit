---
name: copyaudit
description: >
  Use when the user says write copy, rewrite this page, score this copy,
  this sounds like AI, audit this URL, write this ad, write a speech,
  write VO, or hands over an mp3. Not the public Copyaudit app.
---

# Copyaudit (in-house)

1. The user names the piece or hands over the artifact.
2. Read the brand file for that mouth. Ask once if the brand is unnamed.
3. Classify. Refuse to write with no Schwartz awareness.
4. Score in a later pass. A same-pass score is invalid.
5. They do not pick a skill.

Operator-only. Do not call the Copyaudit Next/Stripe app, `/api/audit`, or Neon.

Anti-slop: `~/Apps/agent-practices/policy/anti-slop.md`. Invented stats/prices are a miss. Facts come from the brief, page, or transcript. Never from this skill.

Load `~/Apps/copyaudit/src/lib/copy-analyzer.ts` (`SYSTEM_PROMPT`) for **written** scoring. Do not paste it elsewhere. Do not use vid-craft `SCRIPT.md` files as goldens.

Oscar-mouth only: last30days `FOUNDER_VOICE`. Talent jobs do not get founder “I”.

## Read the brand

Read the file. Do not restate it.

| Mouth | Read |
|---|---|
| Oscar, oscaribars.com, a field note | `topics/personal-brand.md` Copy safety and Humanizer. Founder "I" only here. Craft string: `~/Apps/personal-brand/src/lib/humanize-craft.ts` |
| SwiftRecap | `topics/swiftrecap.md` Editorial rules and Writer QA |
| Product Leader Academy social | `topics/productleaderacademy.md` Social copy hygiene. The gate in the repo is `sanitizeSocialCopy` |
| Public HaloPT | `topics/personal-brand.md` Public HaloPT voice, and `topics/halopt.md` for facts |
| Unnamed | Ask which brand once. No founder "I" |

## Pick the job

Infer from the artifact. If spoken mode is ambiguous, ask once: **voiceover / ad / storytelling**.

| Artifact or ask | Job |
|-----------------|-----|
| URL | **written audit** — fetch the page, score the copy |
| Pasted page / landing / email / UI copy | **written audit** (or **copywriter** if they said write/rewrite) |
| MP3 / wav / m4a / “this audio” | **`voicebox.transcribe`** (`audio_path` absolute). If Voicebox is down, **`media-use`** audio engine. Then **spoken audit** |
| Transcript + “audit” | **spoken audit** |
| “Write landing / page / email” | **copywriter** |
| “Write an ad” / short paid or social cut | **ads writer** |
| “Write a speech / story / keynote” | **speech writer** |
| “Write VO / voiceover” | **voiceover** |
| “Rewrite” / apply fixes | Same job as the source, apply line fixes, re-score |

Do not guess a transcript. Discover Voicebox through `mcp-pro` using the active session's tools; the documented surface includes `voicebox.speak`, `voicebox.transcribe`, `voicebox.list_profiles`, and `voicebox.list_captures`. If that route is absent, check available native transcription, `media-use`, or an existing authenticated HeyGen route. Continue independent copy work and report only the blocked audio operation. For sourcing and provider entitlement, use [shared creative resources](/Users/oscar/.agents/skills/image-router/references/creative-resources.md).

## Order (always)

1. **Classify** (card below). Write jobs: missing Schwartz awareness = **refuse to write**. Ask once, in one batch.
2. **Write** (if asked): ads/speeches get a big-idea / sticky story *before* hooks. Then the draft. Do not score while drafting.
3. **Score** (second pass, stranger wrote it): 5 dims.
4. **Chief**: line flags + kill list.
5. **Detect** (third pass, detect-only).
6. Mechanical pass/fail.
7. **Listen-test** (spoken jobs only) — Voicebox, then human lock.

Same-pass scores are invalid.

Named vid-craft generate is a **handoff** after ads/VO **pass and the human has locked the heard line**: write `~/Apps/vid-craft/jobs/<name>/SCRIPT.md` only if the user named that job. Kit facts (price, never-say, speaker): `~/Apps/vid-craft/kits/<slug>/`. 8-line / classify / assets: `~/Apps/vid-craft/README.md`. Empty assets = stop generate, not stop copy. Paid placement after an ad passes: `paid-media-pro`. HeyGen / Speechify / Simba only after lock. Do not read `ai-video/projects/` for prices.

## Classify (before write or score)

One card, then work:

| Field | Values |
|-------|--------|
| Type | page / email / ad / VO / speech |
| Funnel | cold / warm / retarget / existing |
| Schwartz | Unaware / Problem-aware / Solution-aware / Product-aware / Most-aware |
| Big idea | one sentence, or “none yet” |

Write by awareness (do not skip):

- **Unaware** — no pitch. Observation or story that makes the problem felt.
- **Problem-aware** — name the pain more specifically than they expect. Do not name our product.
- **Solution-aware** — category is allowed. Mechanism, not brand stack.
- **Product-aware** — proof and objections. Offer is not the lead.
- **Most-aware** — lead with the offer.

## Written (URL / text)

Use `SYSTEM_PROMPT` unchanged (hero / features / pricing / testimonials / CTA).

Output: overall 0–100; five dims 0–100 + reasoning + examples that are **literal substrings** of the page copy; `copyGold`; then **Chief** + **Detect**.

**Fail if:** examples are not substrings; a number isn’t on the page or in the brief; you audited a layout instead of the words.

## Spoken modes (MP3 / transcript / write)

Lock a mode after the transcript exists:

| Mode | What it is | Score remap |
|------|------------|-------------|
| **voiceover** | Picture-led VO. Supports the image; not a standalone pitch | contrast = not generic B-roll talk; specificity = one checkable fact; anxiety = nothing the picture doesn’t earn; jtbd = why this shot exists; cta = usually none (fail if it hard-sells) |
| **ad** | Short paid/social cut | contrast = competitor couldn’t say it; specificity = one sourced fact in the line; anxiety = never-say is doing the work; jtbd = struggle in sentence one; cta = overlay/end card, **not** spoken URL/price |
| **storytelling** | Speech, story, keynote | contrast = a point of view; specificity = earned detail; anxiety = the objection the story answers; jtbd = why this audience, now; cta = the ask at the end (spoken is allowed; still no fake numbers) |

Ads writer: big idea → 3 hooks (one recommended) → Spoken → Overlay (price/URL here) → Never-say.

Speech writer: big idea → through-line → spoken draft (timed if they gave a length) → Never-say.

Voiceover: timed lines against the picture/brief → Never-say (what the VO must not explain).

Lock **speaker** when a mouth is on camera: named talent vs Oscar twin. Wrong mouth = fail.

## Listen-test (spoken jobs, after pass)

Hear the **exact Spoken line** before anyone generates video or paid TTS.

1. `voicebox.list_profiles` if the profile isn’t known.
2. `voicebox.speak` with `personality: false` (or omit). **Never `personality: true` here** — that rewrites the line and cheats the critic.
3. Prefer engine `kokoro` for drafts. Named clone only when the user asked to hear *that* mouth.
4. Operator hears it. They lock, or you rewrite and listen again.

Voicebox must be running (`127.0.0.1:17493`). Pin Grok’s client voice in Voicebox → Settings → MCP (`X-Voicebox-Client-Id: grok`). If speak fails, say so — do not skip to HeyGen.

## Chief (after score)

Every issue is one flag. No flag without a rewrite.

- **Location** — quote a substring of the scored copy (timestamp if VO)
- **Issue** — why it weakens the piece
- **Fix** — actual replacement copy, not advice
- **Framework** — which of the six (Lepers / Bencivenga / Kennedy / Dunford / Christensen / Copyhackers)

Then a **kill list**: lines or phrases to delete, not rewrite. Empty kill list is allowed only if you say “nothing to cut.”

`top3Fixes` is the three highest-impact flags. The rest can stay in the list.

## Detect (third pass, detect-only)

Do not rewrite in this pass. Flag only:

- phrases banned in `~/Apps/agent-practices/policy/anti-slop.md`
- First person the **source** did not have (don’t install an “I”)
- Manufactured stakes (“in a world where”, “now more than ever”)
- Forced contrarian openers the source didn’t earn
- A "not X, it's Y" turn the source did not already use

A clean detect pass is not a pass on the critic. It only means you didn’t add a new AI accent.

## Pass / fail

**All jobs fail if:** a dimension’s `examples` are not literal substrings; a number/stat isn’t in the source (page, transcript, or brief); write proceeded without Schwartz awareness.

**Ad fails if:** Spoken contains a URL or price; Never-say is empty.

**Voiceover fails if:** it hard-sells like an ad; it narrates what the picture already shows and nothing else.

**Story/speech fails if:** no point of view; CTA is a spoken URL.

Pass = none of the above **and** detect didn’t introduce new voice. Spoken jobs also need a Voicebox listen-test and a human lock before shoot.

## Do not

- Treat any current vid-craft `SCRIPT.md` as a model
- Vendor Palmer, copy-that-sells, or avoid-ai-writing into this file
- Revive Copyaudit as a public brand or checkout
- Route this through `marketing-pro` first
- Let `marketing-pro`, `paid-media-pro`, or `social-scheduler-pro` rewrite a line. They run after a pass.
