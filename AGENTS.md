# Copyaudit agent procedure

Call the skills in `.grok/skills/`. Leave `/api/audit` and the Next.js app alone.

Skills live in `.grok/skills/`. `.agents/skills/` and `.claude/skills/` are links to those same directories.

| Skill | When |
| --- | --- |
| `copyaudit` | Write, rewrite, score, a URL, an ad, a speech, VO, or an mp3 |
| `copy-humanizer` | A later pass on a draft that already exists |

`copy-humanizer` reads `~/Apps/agent-practices/policy/anti-slop.md`. When the mouth is Oscar it also reads `~/Apps/personal-brand/src/lib/humanize-craft.ts`. It does not keep a second tell list.

Other repos load these skills from the absolute links `~/Apps/agent-practices/install.sh` writes. Do not link them into another repo with a relative sibling path.

This repo has no `agent.json`. The copy hook stays quiet here. Codex does not run the Grok hook. In Codex, `search_tool` / `use_tool` means find the tool, then call it. A hook reminder is not proof the copy passed.

HaloPT product work stays in `~/Apps/halopt`. Film jobs stay in `~/Apps/vid-craft`.
