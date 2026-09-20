---
name: magic-native-ui-cli
description: >-
  Develop the magic-native-ui CLI in ../magic-native-ui-cli — the commander-based
  tool that runs init, add, list, view, diff and icon add/list against the
  registry. Covers its layout (commands, registry client with zod schemas,
  updaters for css/metro/tsconfig/files/dependencies/icons), the conventions it
  follows (CliError for anything the user can fix, clack prompts, idempotent
  updaters, alias-aware import rewriting), and how to build and test it against
  a local registry. Use this skill when adding or changing a command or flag,
  when init misconfigures a project, when add writes files to the wrong place,
  when the registry client needs a schema change, or when publishing the CLI.
---

# Magic Native UI — the CLI

Lives in `../magic-native-ui-cli`, published to npm as `magic-native-ui`. It fetches the static
JSON the registry build produces and copies sources into a user's project, rewriting imports to
that project's aliases on the way in. There is no runtime package — once a file is copied, the
user owns it.

```bash
npx magic-native-ui@latest init
npx magic-native-ui@latest add button dialog card
npx magic-native-ui@latest icon add heart star
```

Requires Expo SDK 57+ (RN 0.86+), React 19, Tailwind v4, Node 20+.

## Layout

```
src/
  index.ts              commander wiring — every command and flag is declared here
  commands/             init, add, list, view, diff, icon
  registry/
    api.ts              fetch + in-process cache, item-tree resolution
    schema.ts           zod schemas for registry responses
    icons.ts            icon index and shard fetching
  utils/
    config.ts           components.json schema, alias resolution from tsconfig
    project.ts          detects Expo, TypeScript, css entry, metro config
    transform.ts        import rewriting + target path per file type
    logger.ts           logger + CliError
    json.ts             jsonc parsing, for tsconfig
    updaters/           css, metro, tsconfig, files, dependencies, icons
```

Read `references/architecture.md` before changing how a command resolves config, writes files or
talks to the registry — it covers each layer's contract and the invariants that hold across them.

## Conventions

These are consistent across the codebase; a new command that breaks one will feel foreign.

**`CliError` for anything the user can fix.** It is reported in `main()` without a stack trace —
unreachable registry, 404, missing `components.json`. A thrown `Error` means a bug and gets the
full trace. `z.ZodError` is caught separately and printed with `z.prettifyError`, because a schema
mismatch means the registry shipped something unexpected.

**Prompt with `@clack/prompts`, and always honour `--yes`.** Every prompt goes through the
`cancelled()` guard so Ctrl-C exits cleanly rather than continuing with an undefined answer.

**Updaters are idempotent.** Running `init` twice must not duplicate anything. `updateCss` only
appends the theme block when the file has no `--color-background`, and only prepends the imports
it finds missing. Match that shape: read, compute the difference, write only if it changed, and
return what you did so the command can report it.

**Report what happened, not what was intended.** Updaters return a result (`created`,
`addedImports`, `addedTheme`, `status`) and the command prints from it. That is why `init` can say
"already wraps withUniwindConfig" instead of claiming it configured Metro.

**Warn and continue where the user may know better.** `init` warns on a non-Expo project or a
missing tsconfig rather than refusing. A `metro.config.js` pointing at a different stylesheet gets
a warning naming both paths, because guessing wrong there would break their build.

**Never guess a path.** Aliases come from `components.json` resolved against the project's
`tsconfig.json` paths. `targetPathFor` maps a file's `type` to its destination directory, with
`target` overriding the file name. Adding a new `registry:*` type means adding a case there.

## Import rewriting

Sources ship with `@/registry/...` imports. `transformImports` rewrites them to the project's
configured aliases:

```
@/registry/lib/utils  ->  aliases.utils   (default @/lib/utils)
@/registry/lib/*      ->  aliases.lib     (default @/lib)
@/registry/ui/*       ->  aliases.ui      (default @/components/ui)
@/registry/hooks/*    ->  aliases.hooks   (default @/hooks)
```

`@/registry/lib/utils` is replaced first and as a whole string, because `utils` has its own alias
that is not simply `lib/utils`. Keep that ordering if you touch the function.

## Adding a command or flag

1. Declare it in `src/index.ts` with commander — description, arguments, options, and an action
   that maps flags onto a typed options object. Every command takes `-c, --cwd` and, where it
   talks to the registry, `--registry`.
2. Implement it in `src/commands/<name>.ts`, exporting one function taking that options object.
3. Reuse `resolveConfig`, the registry client and the existing updaters rather than reaching for
   `fs` directly — that is what keeps alias handling and idempotence consistent.
4. Support `--yes` and, if it writes, `--dry-run`.
5. Update `README.md` — the command table and the flag list are the documented interface.

## Build and test

```bash
npm run typecheck
npm run build           # tsup -> dist/
npm run dev             # tsup --watch
node dist/index.js add button --cwd ../magic-ui-test
```

Test against a local registry rather than production:

```bash
# in magic-native-ui-docs
bun run dev
# then
node dist/index.js add button --registry http://localhost:3000/r --cwd ../magic-ui-test
```

`MAGIC_NATIVE_UI_REGISTRY` does the same via the environment. `../magic-ui-test` is a real Expo
app kept for this — install into it and run it, since a component that writes cleanly can still
fail to compile.

Check the `--dry-run` output of any command that writes before trusting it, and re-run `init`
twice in a row to confirm nothing is duplicated.

## Publishing

`prepublishOnly` runs `typecheck` and `build`, and `files` limits the package to `dist`. Bump the
version in `package.json` **and** the `.version()` call in `src/index.ts` — they are separate
strings and drift silently. The CLI is the only npm artifact in this project; the registry itself
is static JSON served by the docs site.
