# AI skills for Magic Native UI

Skills are instructions an AI coding agent loads on demand. Each folder here holds a `SKILL.md`
with YAML frontmatter (`name`, `description`) plus optional `references/` files. The agent always
sees the name and description; it reads the body when the description matches the task, and the
reference files only when the body points at one. That layering is why these can go deep without
costing anything on unrelated work.

Claude Code discovers them automatically from `.claude/skills/` when the session's working
directory is this repo. They are checked into git so everyone working on the project — and every
agent — gets the same instructions.

## The skills

| Skill | Use it for |
| --- | --- |
| [`magic-native-ui-component`](magic-native-ui-component/SKILL.md) | Writing, editing, porting or reviewing a component in `registry/ui/`. The React Native + Uniwind rules and the pipeline for landing a new one. |
| [`magic-native-ui-registry`](magic-native-ui-registry/SKILL.md) | `registry.json`, the four build scripts, and getting a change into the docs site. |
| [`magic-native-ui-icons`](magic-native-ui-icons/SKILL.md) | Lucide inside components, the vendored Hugeicons pipeline, icon naming and aliases. |
| [`magic-native-ui-cli`](magic-native-ui-cli/SKILL.md) | Developing the CLI in `../magic-native-ui-cli`. |
| [`magic-native-ui-app`](magic-native-ui-app/SKILL.md) | Using the registry from a consuming Expo app such as `../magic-ui-test`. |

Most component work touches two: `magic-native-ui-component` to write it,
`magic-native-ui-registry` to ship it.

They serve two audiences. `magic-native-ui-app` is for people *using* Magic Native UI in their own
Expo app; the other four are for people working *on* this repo and its siblings.

## Installing them elsewhere

`.claude/skills/` is one of the directories [`npx skills`](https://skills.sh) discovers, so these
are installable from GitHub as they are — no separate packaging step.

Someone building an app with Magic Native UI wants only the consumer skill:

```bash
npx skills add avijit969/magic-native-ui --skill magic-native-ui-app
```

Someone contributing to the library wants all of them:

```bash
npx skills add avijit969/magic-native-ui --skill '*'
```

That is also how to close a gap in the project-skill setup: these skills cover work in
`magic-native-ui-cli` and `magic-native-ui-docs`, but `.claude/skills/` only loads when Claude
Code starts in *this* repo. Installing them makes them available in the sibling repos too.

The skills.sh directory has no submission step — it indexes from install telemetry, so a skill
appears once people install it. Nothing to file, and nothing to maintain beyond this folder.

## Layout

```
.claude/skills/
├── README.md
├── magic-native-ui-component/
│   ├── SKILL.md
│   └── references/
│       ├── conventions.md         the eight rules, each with the failure it prevents
│       ├── patterns.md            cva, context, controlled state, asChild, platform differences
│       ├── tokens.md              every theme token and the utilities it generates
│       └── review-checklist.md    pre-merge checklist, ordered by what is most often wrong
├── magic-native-ui-registry/
│   ├── SKILL.md
│   └── references/
│       ├── registry-json.md       item schema, types, dependency rules, target paths
│       └── pipeline.md            what each build script does and how it fails
├── magic-native-ui-icons/
│   └── SKILL.md
├── magic-native-ui-cli/
│   ├── SKILL.md
│   └── references/architecture.md the four layers and their contracts
└── magic-native-ui-app/
    ├── SKILL.md
    └── references/troubleshooting.md
```

## Writing or editing a skill here

The `description` is the whole triggering mechanism — the agent chooses a skill from it alone, so
it has to say both what the skill does and when it applies, including the phrasings someone would
actually use. "Add a slider" and "the switch looks wrong on Android" should both reach
`magic-native-ui-component`, and neither mentions Uniwind or a registry.

Beyond that:

- Keep `SKILL.md` short enough to read in full (a few hundred lines at most) and push depth into
  `references/`, with a line in the body saying when to open each one.
- Explain the failure a rule prevents, not just the rule. Most of what is documented here is a web
  habit that silently does nothing on native, and an agent that knows the symptom can diagnose a
  case nobody wrote down.
- Point at real files. `registry/ui/switch.tsx` stays correct as the code changes; a copied
  snippet in a skill goes stale and starts teaching the wrong thing.
- Cross-reference by skill name rather than duplicating. Duplicated instructions drift apart, and
  then one of them is wrong.

When these instructions and the code disagree, the code is right — fix the skill.
