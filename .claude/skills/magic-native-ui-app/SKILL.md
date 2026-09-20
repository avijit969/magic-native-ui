---
name: magic-native-ui-app
description: >-
  Set up and use Magic Native UI inside a consuming Expo app — running init,
  adding components and icons with the CLI, wiring the Tailwind entry stylesheet,
  Metro and tsconfig for Uniwind, switching themes with Uniwind.setTheme, and
  writing screens with the installed components. Use this skill when working in
  an app that consumes the registry (such as ../magic-ui-test) rather than the
  registry itself: installing or upgrading components, fixing "className does
  not exist" type errors, styles that do not apply, Metro resolution failures,
  or when deciding whether to edit an installed component or change it upstream.
---

# Magic Native UI — using it in an app

The CLI copies sources into the project. There is no component package to install and no version
to bump: once `components.json` exists, `add` writes files and you own them.

`../magic-ui-test` is the workspace's consuming app, kept for exactly this.

## Setting up

```bash
npx magic-native-ui@latest init
```

Requires Expo SDK 57+ (RN 0.86+), React 19 and Tailwind v4. `init` writes `components.json`,
creates the Tailwind entry stylesheet with the theme tokens, configures Metro for Uniwind, adds
the `@/*` alias and `uniwind-env.d.ts`, and installs `uniwind`, `tailwindcss`, `clsx`,
`tailwind-merge` and `class-variance-authority`.

Four things have to be true afterwards, and `init` will warn rather than fail if it could not do
one of them:

1. **The stylesheet is imported once, at the app root.** In Expo Router that is
   `app/_layout.tsx` — `import '../global.css'`. Without it nothing is styled at all.
2. **`metro.config.js` wraps the config with `withUniwindConfig`, outermost**, pointing
   `cssEntryFile` at that same stylesheet. `init` writes this file but never rewrites an existing
   one; if the project already had a Metro config, check it by hand.
3. **`tsconfig.json` has the `@/*` path alias**, matching the aliases in `components.json`.
4. **`uniwind-env.d.ts` exists**, or TypeScript reports `className` as an unknown prop on every
   component in the project.

`init` is safe to re-run — it tops up what is missing rather than duplicating.

## Adding components

```bash
npx magic-native-ui@latest list              # what is available
npx magic-native-ui@latest view button       # its files and dependencies
npx magic-native-ui@latest add button dialog # add, with dependencies
npx magic-native-ui@latest add button --dry-run
```

Registry dependencies come along automatically — `add button` also writes `lib/utils.ts` and
`components/ui/text.tsx`, and installs the npm packages the tree needs. Existing files are left
alone unless you pass `--overwrite`, so local edits survive a re-run.

```bash
npx magic-native-ui@latest icon list heart   # search 5,437 free Hugeicons
npx magic-native-ui@latest icon add heart star
```

## Writing screens

Wrap labels in `<Text>`. That is not a style preference — React Native has no CSS inheritance, so
a component publishes its text classes through context and `<Text>` is what reads them:

```tsx
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

<Button variant="outline" size="lg" onPress={save}>
  <Text>Save</Text>
</Button>
```

Style with the semantic tokens, never a raw colour, so both themes work:
`bg-background`, `text-foreground`, `bg-card`/`text-card-foreground`,
`bg-primary`/`text-primary-foreground`, `text-muted-foreground`, `border-border`.

The same native constraints that shape the registry apply to your own screens:

- Rows need an explicit `flex-row` — RN defaults to `column`.
- No `hover:`, `before:`, `after:` or `grid-*`. Use `active:`, `disabled:` and flexbox.
- No `dark:` — themes are `@variant` blocks, not a class. Write the token utility.
- Any non-core component you want to style with `className` needs `withUniwind()` at module
  scope. For Lucide icons use the installed `iconWithClassName`; for Hugeicons use `<Icon>`.

## Theming

```tsx
import { Uniwind } from 'uniwind'

Uniwind.setTheme('dark')     // or 'light', or 'system'
```

Tokens live in the Tailwind entry stylesheet under `@layer theme`, with a `@variant light` and a
`@variant dark` block. Retheme by editing those values — every installed component follows,
because none of them name a colour directly.

## Editing an installed component

They are your files; edit them. Two things worth knowing before you do:

- `magic-native-ui diff` compares installed components against the registry and will report your
  edits as drift. That is informational, not a problem — but it does mean `diff` stops being a
  useful upgrade signal for that file.
- `add --overwrite` discards local edits without asking. Check `diff` first.

If the change would be right for everyone, make it in the registry instead and re-run the build
there — see the `magic-native-ui-component` skill. Local edits are for what is specific to this
app.

## Upgrading

```bash
npx magic-native-ui@latest diff              # what has drifted
npx magic-native-ui@latest add button --overwrite
```

There is no version number to bump. `diff` is the whole upgrade story: it tells you which
installed files differ from what the registry now serves, and `add --overwrite` takes the new
version.

## Troubleshooting

`references/troubleshooting.md` covers the failures in the order they tend to appear — styles not
applying, `className` type errors, Metro resolution failures, blank screens from a styleq error,
theme switching doing nothing, and web-only breakage.

## Testing against a local registry

When working on the registry or CLI in this workspace, point the app at a local server rather than
production:

```bash
# in magic-native-ui-docs
bun run dev
# in the app
npx magic-native-ui@latest add button --registry http://localhost:3000/r
```

`MAGIC_NATIVE_UI_REGISTRY` sets the same default via the environment. Always run the app on iOS,
Android and web afterwards — a component that installs cleanly can still fail to render on one
platform.
