# registry.json

The manifest. `scripts/build-registry.ts` compiles it into one JSON file per item plus an
`index.json`, following the shadcn/ui registry schema so the format is familiar and the tooling
around it keeps working.

```jsonc
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "magic-native-ui",
  "homepage": "https://native-ui.magicwebs.ai",
  "items": [ /* … */ ]
}
```

## Item shape

```jsonc
{
  "name": "button",                                  // kebab-case, matches the file name
  "type": "registry:ui",
  "title": "Button",                                 // shown as the docs page heading
  "description": "Pressable with the full set of shadcn variants and sizes.",
  "dependencies": ["class-variance-authority"],      // npm packages
  "registryDependencies": ["utils", "text"],         // other items in this registry
  "files": [{ "path": "registry/ui/button.tsx", "type": "registry:ui" }]
}
```

`name` is load-bearing in four places at once, and they all have to agree:

- the source file name (`registry/ui/button.tsx`)
- the demo file name (`apps/playground/components/demos/button-demo.tsx`)
- the key in `apps/playground/components/demos/index.ts`
- the CLI command a user types (`magic-native-ui add button`)

Quote kebab-case keys in `index.ts` (`'input-otp': InputOTPDemo`). A mismatch does not fail any
build — it silently produces a docs page with no usage code and no preview.

`title` and `description` are the docs page heading and subtitle, and the description is also what
`magic-native-ui list` prints. Write them for someone browsing the component list, not as an
internal note.

## Types

| Type | Used for | Installed to |
| --- | --- | --- |
| `registry:ui` | components in `registry/ui/` | the `ui` alias — `@/components/ui/` |
| `registry:lib` | helpers in `registry/lib/` | the `lib` alias — `@/lib/` |
| `registry:theme` | `registry/themes/default.css` | merged into the Tailwind entry stylesheet |
| `registry:file` | a file's own type inside a theme item, with an explicit `target` | wherever `target` says |

Only `registry:ui` items become docs pages. The docs site filters on that type for the sidebar,
the pager and `generateStaticParams`, so `utils`, `icons`, `hugeicons` and `theme` are installed
but never documented as pages of their own.

## Dependencies

**`registryDependencies`** — other items in this registry, by name. The CLI walks them
transitively (`resolveItemTree`), so listing `utils` and `text` on `button` is what makes
`magic-native-ui add button` produce a button that compiles.

`build-registry.ts` validates these: an entry naming an unknown item fails the build rather than
shipping a registry the CLI cannot install. Entries starting with `http` or `@` are treated as
references to other registries and skipped by that check.

**`dependencies`** — npm packages. The CLI collects them across the whole resolved tree and
installs whatever the project is missing, which means an item does **not** need to repeat a
package that one of its registry dependencies already brings in.

That convention is worth following exactly, because both mistakes are invisible here:

- `dialog` imports `lucide-react-native` directly but declares only
  `registryDependencies: ["utils", "icons", "text"]`. Lucide arrives because the `icons` item
  declares it. Adding it to `dialog` as well would be redundant.
- `button` declares `class-variance-authority` itself, because nothing else supplies it.

So the question to ask per import line is not "is this package used" but "would this package
already arrive through a registry dependency". If you drop an item's `registryDependencies` entry
later, check what npm packages it was silently providing.

Nothing validates `dependencies` against the file's imports. The only real check is installing
into a clean project — `magic-ui-test` is there for that.

## Files and `target`

```jsonc
"files": [{ "path": "registry/ui/button.tsx", "type": "registry:ui" }]
```

`path` is relative to the repo root and must exist — `build-registry.ts` checks. The file's
content is inlined into the built JSON, so the CLI installs a component in one fetch.

`target` overrides the destination, relative to the alias the type resolves to. The `hugeicons`
item uses it to keep a directory structure instead of flattening four files into `lib/`:

```jsonc
{ "path": "registry/lib/hugeicons/icon.tsx", "type": "registry:lib", "target": "hugeicons/icon.tsx" }
```

and the theme item uses it to land as `theme.css`:

```jsonc
{ "path": "registry/themes/default.css", "type": "registry:file", "target": "theme.css" }
```

Without `target`, a file lands at its basename under the alias directory for its type.

## Import rewriting

Sources are written with `@/registry/...` aliases because that is how they resolve in the
playground — which matters, since the playground is what verifies them. On the way out, both the
CLI and `build-demos.ts` rewrite those to a consumer's aliases:

| In the repo | In a user's project |
| --- | --- |
| `@/registry/lib/utils` | `@/lib/utils` |
| `@/registry/lib/*` | `@/lib/*` |
| `@/registry/ui/*` | `@/components/ui/*` |
| `@/registry/hooks/*` | `@/hooks/*` |

This is why a component must not import anything outside `registry/` — there is no rewrite rule
for it, and the import would arrive in someone's project pointing at nothing.

## Adding an item — checklist

1. Add the entry with `name`, `type`, `title`, `description`, `files`.
2. Add `registryDependencies` for every `@/registry/...` import.
3. Add `dependencies` for npm packages no registry dependency already supplies.
4. `bun run build:registry` — it will fail on an unknown dependency or a missing file.
5. Check `public/r/<name>.json` and `public/r/index.json` in the docs repo.
6. Install it into `magic-ui-test` from a local registry and run it.
