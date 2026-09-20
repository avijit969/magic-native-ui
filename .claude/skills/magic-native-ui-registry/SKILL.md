---
name: magic-native-ui-registry
description: >-
  Work on the Magic Native UI registry manifest and its build pipeline —
  registry.json entries and their npm/registry dependency lists, the four build
  scripts (build:registry, build:demos, build:icons, build:preview), and how
  their output lands in magic-native-ui-docs/public as the JSON the CLI installs
  from and the docs site renders. Use this skill when publishing or regenerating
  the registry, when a component installs with a missing dependency or an
  unresolvable import, when a docs page shows a blank preview or no usage code,
  when adding a registry item of any type (ui, lib, theme), or when a change
  needs to reach the documentation site.
---

# Magic Native UI — registry and build pipeline

`registry.json` is the manifest; the four scripts in `scripts/` compile it into static files under
`magic-native-ui-docs/public/`. Nothing is published to npm — the CLI fetches those files and
copies sources into a user's project.

```
registry.json ──build:registry──> ../magic-native-ui-docs/public/r/*.json      (+ index.json)
playground demos ──build:demos──> ../magic-native-ui-docs/public/r/demos/*.json
hugeicons pkg ────build:icons──> ../magic-native-ui-docs/public/r/icons/
playground app ──build:preview─> ../magic-native-ui-docs/public/playground/
```

The docs site reads all four locations at build time. It has no hand-written component pages: the
sidebar, the pager, the component pages, the install command and the usage snippets are all
generated from this output. That is why "the docs are wrong" is nearly always "a build script has
not been run".

## Which script to run

| You changed | Run |
| --- | --- |
| a file under `registry/` or `registry.json` | `bun run build:registry` |
| a file under `apps/playground/components/demos/` | `bun run build:demos` |
| anything a preview renders (component, demo, gallery) | `bun run build:preview` |
| the upstream `@hugeicons/core-free-icons` version | `bun run build:icons` |

Adding a component touches the first three:

```bash
bun run typecheck
bun run build:registry && bun run build:demos && bun run build:preview
```

`build:preview` is the slow one — it runs a full `expo export`, taking a minute or more. It stages
into a temporary directory and copies over the live one afterwards, specifically so the docs site
never serves 404s (a blank preview) while the export runs. Do not "optimise" that by exporting
straight into `public/playground`.

Details on each script's arguments, output shape and failure modes are in
`references/pipeline.md`.

## Adding a registry item

Every item in `registry.json` needs `name`, `type`, `title`, `description`, `files`, and whichever
dependency lists apply. `references/registry-json.md` has the full schema, the three item types
and the `target` rules for files that land outside the default directory.

The two fields that decide whether an install succeeds:

- **`dependencies`** — npm packages the source imports. Miss one and the component installs into a
  project that cannot resolve it.
- **`registryDependencies`** — other registry items it imports through `@/registry/...`. The CLI
  installs these transitively, so `button` listing `utils` and `text` is what makes
  `magic-native-ui add button` give someone a working button.

`build:registry` validates that every `registryDependencies` entry resolves to a known item and
fails the build rather than shipping a registry the CLI cannot install. It does **not** check
`dependencies` against the imports in the file — that one is on you. The reliable way to get it
right is to read the import block at the top of the source and account for every line:
`@/registry/...` imports become registry dependencies, bare package imports become npm
dependencies, and `react`/`react-native` are assumed present.

## Verifying before you publish

Regenerating is not the same as verifying. After the scripts run:

1. Read the generated `public/r/<name>.json`. Its `files[].content` still imports through
   `@/registry/...`, and should — the CLI rewrites to a project's aliases at install time, so the
   registry stays independent of any one project's layout. The demos JSON is the opposite case: it
   is rewritten at build time, because the docs print it as code to paste.
2. Check `public/r/index.json` lists the item, since the docs sidebar and `magic-native-ui list`
   both read it.
3. Check `public/r/demos/<name>.json` exists. If it does not, the demo file name or its key in
   `demos/index.ts` does not match the registry item name, and the docs page will render without
   usage code rather than failing.
4. Check `public/playground/preview/<name>.html` exists, or the docs page shows no preview.
5. Run the docs site and open `/docs/components/<name>`.

Steps 3 and 4 are the ones that fail quietly. `hasPreview()` and `getUsage()` in the docs site
both swallow a missing file and render the page without that section, deliberately, so a component
can be documented before its preview exists.

## Installing from a local registry

To test the real install path without publishing, serve the docs site and point the CLI at it:

```bash
# in magic-native-ui-docs
bun run dev
# in a test app, e.g. ../magic-ui-test
npx magic-native-ui@latest add button --registry http://localhost:3000/r
```

`MAGIC_NATIVE_UI_REGISTRY` sets the same thing as an environment variable. `magic-ui-test` exists
for exactly this — a real Expo app to install into and run.

## Reference files

- `references/registry-json.md` — item schema, the three types, dependency rules, `target` paths.
- `references/pipeline.md` — what each script does, its output, and how it fails.
