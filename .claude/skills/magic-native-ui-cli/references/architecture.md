# CLI architecture

Four layers, each with one job. A command orchestrates; it does not fetch, parse or write
directly.

```
commands/       prompt, orchestrate, report
  ↓
registry/       fetch + validate registry JSON
utils/config    read components.json, resolve aliases against tsconfig
  ↓
utils/transform map a registry file onto a path + rewrite its imports
  ↓
utils/updaters/ the only code that writes to a user's project
```

## `registry/` — the client

`api.ts` fetches and caches by URL in a process-local `Map`, so resolving a dependency tree that
mentions `utils` five times makes one request.

Every failure mode becomes a `CliError` with a message naming the URL: a network error, a 404
("Not found in the registry"), any other non-OK status. Responses are validated with the zod
schemas in `schema.ts`; a `ZodError` escapes to `main()` and is printed with `z.prettifyError`,
because a schema mismatch is the registry's problem, not the user's.

`resolveItemTree` walks `registryDependencies` depth-first with a `seen` set, pushing each item
after its dependencies. The resulting order means files are written in dependency order, and the
flattened `dependencies` across the tree are what `add` installs. An item can be referenced by
name (resolved against the configured registry) or by a full URL — that is how a cross-registry
dependency works, and why the registry build skips validating entries starting with `http` or `@`.

## `utils/config.ts` — components.json

The zod schema defines every field and its default, so a partial `components.json` still parses.
`resolveConfig` turns aliases into absolute paths by reading the project's `tsconfig.json`
`baseUrl` and `paths` — the alias `@/components/ui` becomes a real directory, which is what lets a
project with a `src/` layout work without special-casing.

`DEFAULT_REGISTRY` reads `MAGIC_NATIVE_UI_REGISTRY` before falling back to production, which is
the seam for testing against a local docs server.

Commands other than `init` should fail with a `CliError` when there is no `components.json` — the
fix is `init`, and saying so is more useful than a missing-file trace.

## `utils/project.ts` — detection

Detects the package manager from lockfiles (`bun.lock`/`bun.lockb` → `pnpm-lock.yaml` →
`yarn.lock` → npm), whether the project is Expo and TypeScript, the Expo and RN versions, an
existing `metro.config.js`, and an existing Tailwind entry stylesheet in the usual places.

Everything it returns is a hint that seeds a prompt default, never a hard gate. `init` warns about
a non-Expo project and continues, because someone may be setting up a bare RN app deliberately.

## `utils/transform.ts` — paths and imports

`targetPathFor` maps a file's `type` to a directory in the user's project:

| Type | Destination |
| --- | --- |
| `registry:ui` | `resolvedPaths.ui` |
| `registry:hook` | `resolvedPaths.hooks` |
| `registry:lib` | `resolvedPaths.lib` |
| `registry:component` | `resolvedPaths.components` |
| anything else | the project root |

The file name is `file.target ?? basename(file.path)`, so `target` can carry a subdirectory
(`hugeicons/icon.tsx`) or rename a file (`theme.css`). Adding a new `registry:*` type means adding
a case here; the default lands in the project root, which is rarely what anyone wants.

`transformImports` rewrites `@/registry/...` to the project's aliases. `@/registry/lib/utils` is
replaced first, as a whole string, because `utils` has its own alias that is not necessarily
`lib/utils` — keep that ordering.

## `utils/updaters/` — the writers

The only code that touches a user's project. Each is idempotent and returns a result describing
what it did, so the command can report accurately instead of claiming.

**`files.ts`** — writes registry files. Skips an existing file unless `--overwrite`, returning
`{ path, status: 'skipped' }` so the command can list what it left alone. Honours `--dry-run` by
computing everything and writing nothing. Relative paths are normalised to forward slashes for
display, since this runs on Windows too.

**`css.ts`** — creates the Tailwind entry stylesheet or tops it up. Both `@import 'tailwindcss';`
and `@import 'uniwind';` are required by Uniwind. The theme block is appended only when the file
has no `--color-background`, so re-running never duplicates tokens. The theme CSS itself comes
from the registry's `theme` item rather than being embedded in the CLI, so the CLI and the
documented source cannot drift.

**`metro.ts`** — writes a Metro config when the project has none, and **never rewrites an existing
one**, because it may contain project-specific setup. Instead it reads the `cssEntryFile` literal
with a regex and returns one of `created`, `already-configured`, `css-entry-mismatch` (naming both
paths) or `needs-manual-edit`, and the command prints the appropriate guidance.

The generated config carries two things that are easy to break: `withUniwindConfig` must stay the
outermost wrapper, and package exports are disabled globally then re-enabled for `uniwind` and
`culori` only — RN still uses deep imports like `react-native/rn-get-polyfills` that break with
exports enabled, while Uniwind needs the opposite.

**`tsconfig.ts`** — adds the `@/*` path alias if absent (parsing with `parseJsonc`, since
tsconfigs have comments) and writes `uniwind-env.d.ts`. Without that reference TypeScript does not
know RN components accept `className`, and every component in the project reports an error. Both
return `false` when nothing needed changing.

**`dependencies.ts`** — spawns the detected package manager with `stdio: 'inherit'` so the user
sees real install output. Uses `shell: true` on Windows because npm/yarn/pnpm ship as `.cmd`
shims. A non-zero exit becomes a `CliError`.

**`icons.ts`** — merges named Hugeicons into `lib/hugeicons/icons.ts`, sorted and deduplicated,
keeping what is already there. Because it regenerates that barrel wholesale, it refuses to write
when the file contains code it did not generate — a user's own exports belong in a separate file.

## Command shapes

**`init`** — detect, prompt (unless `--yes`), write `components.json`, fetch `theme` and `utils`
from the registry, update css / metro / tsconfig, install base dependencies (`uniwind`,
`tailwindcss`, `clsx`, `tailwind-merge`, `class-variance-authority`).

**`add`** — resolve config, resolve the item tree, write files, collect the tree's npm
dependencies, diff them against the project's installed packages, install what is missing.

**`list` / `view`** — read `index.json` and a single item; print. No writes.

**`diff`** — fetch installed components again and compare against what is on disk, reporting
drift. This is what makes a stale docs repo actively harmful: it reports drift to every user who
installed the older version.

**`icon add` / `icon list`** — fetch the icon index, resolve names, aliases or exports, fetch only
the shards needed, merge into the project's barrel.

## Adding a command — invariants

- Take `-c, --cwd` and, if it touches the registry, `--registry`.
- Resolve config through `resolveConfig`; never join paths by hand.
- Write only through an updater, so `--dry-run` and idempotence come for free.
- Throw `CliError` for anything a user can fix; let real bugs throw normally.
- Prompt through clack with the `cancelled()` guard, and skip prompts under `--yes`.
- Update the command table and flag list in `README.md`.
