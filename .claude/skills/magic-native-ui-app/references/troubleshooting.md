# Troubleshooting a consuming app

Ordered roughly by how early each one bites. Most of these are configuration, not code — and
several fail silently, which is why the first question is always "is the stylesheet actually
imported".

## Nothing is styled at all

The Tailwind entry stylesheet is not imported, or Metro is not wrapping the config.

1. The app root imports it once — `import '../global.css'` in `app/_layout.tsx`.
2. `metro.config.js` wraps with `withUniwindConfig` as the **outermost** call, with
   `cssEntryFile` pointing at that same file. A config that wraps in the wrong order produces no
   error and no styles.
3. The stylesheet starts with both required imports:
   ```css
   @import 'tailwindcss';
   @import 'uniwind';
   ```
4. Restart Metro with a cleared cache: `npx expo start -c`. Stylesheet and config changes are not
   picked up by a warm cache, and this alone explains a good share of "it stopped working".

## Some classes work, one does not

Check it against the unsupported list before debugging anything else. These compile to nothing
here: `hover:`, `before:`, `after:`, `grid-*`, `group-*` and `dark:`. There is no warning — the
utility is simply absent.

Then check the two that look like styling bugs but are not:

- A row that stacks vertically is missing `flex-row`; RN defaults to `column`.
- A custom class referencing a token that does not exist in the theme produces nothing. The token
  list is in the stylesheet's `@layer theme` block.

## `Property 'className' does not exist on type …`

`uniwind-env.d.ts` is missing, or not covered by `tsconfig.json`'s `include`. It contains one
line:

```ts
/// <reference types="uniwind/types" />
```

Re-running `magic-native-ui init` restores it. If it exists and the error persists, confirm the
file is inside an `include` glob, then restart the TypeScript server.

## Blank screen, or a styleq error at runtime

Something passed `undefined` as a class name. This is the one loud failure in the set: it throws
rather than rendering wrong.

Almost always a component forwarding a `className` its caller did not pass:

```tsx
// Wrong
<View className={className} />
// Right
<View className={cn('base classes', className)} />
```

Look at whatever was rendered most recently, including your own wrapper components around the
installed ones — not only the files the CLI wrote.

## Metro cannot resolve a module

Two distinct causes.

**Package exports.** The generated Metro config disables `unstable_enablePackageExports` globally
and re-enables it for an allowlist. React Native still uses deep imports such as
`react-native/rn-get-polyfills`, which break with exports enabled; Uniwind (with `culori`) needs
the opposite. If a new dependency needs exports, add its prefix to `PACKAGE_EXPORTS_ALLOWLIST` in
`metro.config.js`.

Worth checking while you are in there: an older config may still list `@radix-ui`, left from when
this project built on `@rn-primitives`. It no longer does — the registry is built on React Native
directly — so that entry is harmless but dead.

**A missing npm package.** The CLI installs the dependencies of every item in the resolved tree,
so this usually means a registry item under-declared its dependencies, or `--skip-install` was
passed. `npx magic-native-ui view <component>` lists what it expects; compare against
`package.json`.

## An icon renders black, or ignores its colour

Icons need wrapping to accept `className`:

```tsx
// Lucide
import { Heart } from 'lucide-react-native'
import { iconWithClassName } from '@/lib/icons'
const HeartIcon = iconWithClassName(Heart)   // module scope

// Hugeicons
import { Icon, HeartIcon } from '@/lib/hugeicons'
<Icon icon={HeartIcon} size={20} className="text-primary" />
```

If the icon flickers or loses state on re-render, the wrapper is being created inside a render
function. Move it to module scope.

## `Uniwind.setTheme` does nothing

- Only `'light'`, `'dark'` and `'system'` are valid.
- The stylesheet must define both `@variant light` and `@variant dark` inside `@layer theme`. A
  theme block that was hand-edited down to one variant leaves nothing to switch to.
- There is no `.dark` class anywhere. If code is toggling a class and expecting a theme change,
  that is the bug.

## Text is the wrong colour inside a component

Use `<Text>` from `@/components/ui/text`, not React Native's `Text`. Components publish their text
classes through `TextClassContext`, and only the registry's `Text` reads it. RN's own `Text` will
render in the default foreground colour on a dark button — no error, just unreadable.

## It works on native but breaks on web

Check these before anything else:

- **Blur** (`expo-blur`) is a no-op in some web contexts. Give it a solid fallback background.
- **`Modal`** renders in place on web rather than over the app; overlay z-ordering differs.
- **Shadows** map to `elevation` on Android and a box shadow on web; the three never match exactly.

Build the web bundle rather than trusting the dev server, since the dev server resolves modules
more leniently than an export does.

## `diff` reports drift on a file you edited

Expected — `diff` compares installed files against the registry, and your edits are a difference.
Two consequences: `diff` is no longer a clean upgrade signal for that file, and
`add --overwrite` will discard those edits without asking. If the change would be right for
everyone, move it into the registry instead.

## Nothing above fits

Reproduce it in `../magic-ui-test` against a local registry. A clean Expo app with one component
separates "the registry ships something broken" from "this app's configuration is off", and that
is usually the whole diagnosis.
