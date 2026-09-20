# The build scripts

Four scripts in `scripts/`, all writing into `../magic-native-ui-docs/public/`. Each takes an
optional `--output <dir>` (`-o`) if you need to write somewhere else — useful for inspecting
output without touching the docs repo.

All four are run from the registry repo root with `bun run <name>`.

## `build:registry` — `scripts/build-registry.ts`

`registry.json` plus the files it names → `public/r/*.json` and `public/r/index.json`.

For each item it inlines every file's content, so the CLI installs a component in a single fetch:

```jsonc
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "…",
  "dependencies": ["class-variance-authority"],
  "registryDependencies": ["utils", "text"],
  "files": [{ "path": "registry/ui/button.tsx", "content": "…", "type": "registry:ui" }]
}
```

`index.json` carries `name`, `type`, `title`, `description` and `registryDependencies` for every
item, so `magic-native-ui list` and the docs sidebar work without N fetches.

**It validates before writing**, and throws with every problem listed rather than the first:

- a `registryDependencies` entry that names no known item (entries starting with `http` or `@`
  are other-registry references and are skipped)
- a `files[].path` that does not exist on disk

It does not check `dependencies` against the file's imports. Nothing does.

## `build:demos` — `scripts/build-demos.ts`

`apps/playground/components/demos/*-demo.tsx` → `public/r/demos/*.json`.

The demo name is the file name with `-demo.tsx` stripped, which is why the file has to be named
after the registry item. Imports are rewritten to a consumer's aliases on the way out — the same
rewrite the CLI applies — so what the docs print is code a reader can paste into their own app:

```
@/registry/lib/utils  ->  @/lib/utils
@/registry/lib/*      ->  @/lib/*
@/registry/ui/*       ->  @/components/ui/*
@/registry/hooks/*    ->  @/hooks/*
```

That rewrite is also the reason a demo must import **only** from the registry. Anything else
arrives in the snippet pointing at a path the reader does not have.

**It warns, it does not fail.** A `registry:ui` item with no matching demo prints
`No usage example for: <names>` and the build succeeds. Watch for that line — the docs page will
render with an empty Usage section rather than breaking.

## `build:preview` — `scripts/build-preview.mjs`

The playground → `public/playground/`, as a static web export, one HTML file per component via
the `preview/[name]` route.

This is the slow one: a full `expo export -p web`. Two details in it are deliberate and should
not be "simplified":

- It exports into `public/playground.tmp` and copies over the live directory afterwards, because
  `expo export --clear` empties its output directory first — exporting straight into
  `public/playground` would leave the docs site serving 404s, and therefore blank previews, for
  the whole minute the export takes.
- It copies file by file rather than renaming the directory, because on Windows a directory the
  dev server is watching cannot be renamed.

It runs with `MAGIC_PREVIEW_BASE_URL=/playground` and `CI=1`. The preview route reads
`?theme=dark` so an embedded preview matches the surrounding docs page, and strips a trailing
`.html` from the route param because the static export is served as `preview/button.html` while
dev serves it without the extension.

Run this after changing a component, a demo, or the gallery — anything a preview renders.

## `build:icons` — `scripts/build-icons.ts`

`@hugeicons/core-free-icons` → `public/r/icons/`: an index of every icon plus fixed-size shards
of path data, ~250 icons per shard (around 300 KB each).

Sharding is the whole point. The upstream barrel is 6.18 MB; sharding makes `icon add heart` a
~300 KB fetch. `@hugeicons/core-free-icons` is a devDependency of this repo only and never ships
to a user's project.

Run it only when taking a new upstream version. It fails rather than emitting two icons that claim
the same registry name. See the `magic-native-ui-icons` skill for naming, aliases and the
consumer side.

## Ordering and verification

```bash
bun run typecheck
bun run build:registry && bun run build:demos && bun run build:preview
```

The scripts are independent — there is no shared state and no required order — but running
`build:registry` first means an invalid manifest stops you before you wait out the export.

After they finish, check the docs repo rather than trusting the console output:

| File | Missing means |
| --- | --- |
| `public/r/<name>.json` | the component is not installable |
| `public/r/index.json` contains the item | not in `list`, not in the sidebar |
| `public/r/demos/<name>.json` | docs page renders with no usage code |
| `public/playground/preview/<name>.html` | docs page renders with no preview |

The last two fail silently by design: `getUsage()` and `hasPreview()` in
`magic-native-ui-docs/lib/registry.ts` both swallow a missing file so a component can be
documented before its preview exists.

## Committing the output

The generated files live in a different repo (`magic-native-ui-docs`), so a component change is
two commits in two repos. Regenerate and commit them together — a docs repo carrying JSON for a
component whose source has since changed is worse than one that is a version behind, because
`magic-native-ui diff` will report drift for everyone who installed it.
