# Magic Native UI

Copy-paste components for React Native, Expo and web — the shadcn/ui model, rebuilt for native.
Nothing here is published as a component library: a CLI copies source files into your project and
you own them from that point on.

- **Styling** — [Uniwind](https://uniwind.dev) compiles Tailwind v4 classes into native styles.
- **Behaviour** — [`@rn-primitives/*`](https://rnprimitives.com) supplies unstyled, accessible
  primitives (Radix on web, native accessibility APIs on device).
- **Variants** — `class-variance-authority`, the same as on the web.

## Repository layout

This repo is the registry and its playground. The CLI and the documentation site live alongside it:

| Directory | Purpose |
| --- | --- |
| `magic-native-ui/` | Component source of truth + Expo playground (this repo) |
| `magic-native-ui-cli/` | The `magic-native-ui` CLI |
| `magic-native-ui-docs/` | Next.js docs site, which also hosts the registry at `/r/*.json` |

```
registry/                 files copied verbatim into user projects
  lib/utils.ts            cn()
  lib/icons.tsx           className -> color mapping for Lucide icons
  lib/primitive.tsx       keeps class names intact through the web primitives
  lib/hugeicons/          <Icon> renderer + the barrel the CLI vendors icons into
  themes/default.css      design tokens
  ui/*.tsx                the components
apps/playground/          Expo app that renders every component on iOS, Android and web
  components/demos/       one usage example per component, shipped to the docs as its Usage code
registry.json             the manifest the build script compiles
scripts/build-registry.ts registry.json -> ../magic-native-ui-docs/public/r/*.json
scripts/build-demos.ts    playground demos -> ../magic-native-ui-docs/public/r/demos/*.json
scripts/build-icons.ts    @hugeicons/core-free-icons -> ../magic-native-ui-docs/public/r/icons/
scripts/build-preview.mjs playground -> ../magic-native-ui-docs/public/playground
```

The playground imports components through `@/registry/ui/*`, so the files that ship are the files
that are actually run and verified.

## Development

```bash
bun install
bun run playground          # press i, a or w
bun run build:registry      # regenerate the registry JSON
bun run build:demos         # regenerate the usage examples the docs show
bun run build:icons         # regenerate the icon index and shards
bun run build:preview       # regenerate the docs previews
```

## Conventions that matter

React Native is not the web, and a few differences shape every component here.

1. **No CSS inheritance.** A `<Text>` inside a `<Button>` cannot inherit the button's colour.
   Components publish their text classes through `TextClassContext` (`registry/ui/text.tsx`)
   instead, which is why labels are wrapped in `<Text>`.
2. **No `group-*`.** Those variants are a Uniwind Pro feature. Child elements read state from their
   own `data-*` props instead — see `registry/ui/switch.tsx`.
3. **No `hover:`, `before:`, `after:` or `grid-*`.** Use `active:` and `disabled:`, and lay out with
   flexbox.
4. **Inline `style` always beats `className`.** Never spread a caller's `style` over a component's
   own classes; `registry/ui/skeleton.tsx` passes one deliberately, for the animated opacity only.
5. **Wrap with `withUniwind()` at module scope.** Any component that is not a React Native core
   component — every `@rn-primitives` part, every Lucide icon — needs it, and wrapping inside a
   render function recreates the wrapper on every render.
6. **Themes are `@variant` blocks**, not a `.dark` class. See `registry/themes/default.css`; switch
   with `Uniwind.setTheme('dark' | 'light' | 'system')`.
7. **Wrap primitives with `withFlatStyle()` too.** Uniwind resolves `className` into a `style`
   *array*, and the web build of every `@rn-primitives` part hands its props to a Radix `asChild`
   slot, which merges styles with an object spread — turning that array into `{ 0: ... }`. The
   classes are dropped and the next render throws, blanking the tree. `registry/lib/primitive.tsx`
   flattens the style first: `withUniwind(withFlatStyle(LabelPrimitive.Text))`.
8. **Never forward a `className` the caller did not pass.** `className={className}` sends
   `undefined` into Uniwind, which styleq then rejects. Spread the props instead, or run the value
   through `cn()`.

## Adding a component

1. Write `registry/ui/<name>.tsx` following the conventions above.
2. Add `apps/playground/components/demos/<name>-demo.tsx` and register it in
   `apps/playground/components/demos/index.ts`. One self-contained file per component: it is both
   the preview the docs embed and the Usage code they print, so it has to read well on its own and
   import nothing but the registry.
3. Render it in `apps/playground/app/index.tsx` so the gallery covers it too.
4. Add an entry to `registry.json` with its npm and registry dependencies.
5. Run `bun run build:registry && bun run build:demos && bun run build:preview`, then verify on all
   three platforms.

## Icons

`@hugeicons/core-free-icons` is a devDependency here and never ships to a user's project. Its
6.18 MB barrel is compiled by `bun run build:icons` into an index plus 22 shards of path data, and
`magic-native-ui icon add heart` copies just the icons you name into `lib/hugeicons/icons.ts`.

Exports keep the upstream Hugeicons name (`HeartIcon`, `Add01Icon`); the registry name is its
kebab-case form (`heart`, `add-01`). Where upstream ships one drawing under several names, the
least-shouting `*Icon` spelling wins and the rest become searchable aliases — so `icon add plus`
resolves to `AddIcon`. Rerun `build:icons` to take a new upstream version; the script fails rather
than emitting two icons that claim the same name.

## Metro configuration

Two things in `apps/playground/metro.config.js` are easy to get wrong and are reproduced by the
CLI's `init`:

- `withUniwindConfig` must be the **outermost** wrapper.
- Package exports are disabled globally and re-enabled only for `uniwind`, `culori` and
  `@radix-ui`. React Native still uses deep imports that break when exports are on, while those
  three packages require them.
