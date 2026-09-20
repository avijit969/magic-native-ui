# Pre-merge checklist

Ordered by how often each item is actually wrong. The early items are silent failures — nothing
throws, the component just renders incorrectly, often on one platform only.

## Styling

- [ ] Every row has an explicit `flex-row`. RN defaults to `column`, and a missing one gives a
      stacked layout with no error.
- [ ] No `hover:`, `before:`, `after:`, `grid-*` or `dark:` — none of them do anything here.
- [ ] No `group-*`. Children carry their own `data-*` and style from it.
- [ ] Both sides of every boolean state have an explicit class (`data-[state=checked]:` **and**
      `data-[state=unchecked]:`), not one styled value and an unstyled default.
- [ ] No hardcoded colours. Semantic tokens only, and `bg-x` is paired with `text-x-foreground`.
- [ ] `disabled:opacity-50` is in the cva base string, not repeated per variant.

## Props and class handling

- [ ] `className` is never forwarded bare. It goes through `cn()`, or is left in `props`.
- [ ] No caller `style` spread over the component's own classes. If there is a deliberate inline
      style, it has a comment explaining why a class could not express it.
- [ ] `{...props}` is spread last, so callers can override native props.
- [ ] Props extend `React.ComponentProps<typeof X>` rather than listing a handful by hand.
- [ ] `defaultVariants` is set, so the component renders with no props.
- [ ] The component, its cva objects and its props type are all exported.

## Structure

- [ ] `withUniwind()` / `iconWithClassName()` calls are at module scope, never inside render.
- [ ] Text inside the component is a `<Text>` reading `TextClassContext`, with a matching
      `*TextVariants` object whose variant keys line up with the main cva object's.
- [ ] Compound parts share state through a context with a guarded hook that names the part in its
      error message.
- [ ] Controlled/uncontrolled is handled with `prop ?? internal` and the callback fires in both
      modes — or the component is deliberately controlled-only and its types say so.
- [ ] `asChild` exists only on triggers and closers, and clones a single child.
- [ ] Imports use `@/registry/...`. No relative paths reaching outside the file's own directory,
      and no imports from the playground.

## Accessibility

- [ ] Every interactive element has a `role`.
- [ ] State is mirrored in `aria-*` (`aria-checked`, `aria-disabled`, `aria-valuetext`), not only
      in `data-*`.
- [ ] `disabled` is passed to the underlying `Pressable`, not just styled.
- [ ] Touch targets are at least 44pt / 48dp — size the `Pressable`, not just the icon inside it.

## Registry wiring

- [ ] `registry.json` has an entry whose `name` matches the file name in kebab-case.
- [ ] `registryDependencies` lists every `@/registry/...` import: `utils` for `cn`, `text` for
      `<Text>`, `icons` for `iconWithClassName`, plus any sibling component it renders. The CLI
      resolves these transitively, so this list is also what carries their npm packages in.
- [ ] `dependencies` lists the npm packages this item needs that no registry dependency already
      supplies — `class-variance-authority` for cva, `expo-blur` for blur. A component that gets
      Lucide through the `icons` item does not repeat `lucide-react-native`; that is the existing
      convention (see `dialog`), so match it rather than listing packages twice.
- [ ] `title` and `description` are written for the docs page, because that is where they appear.

## Playground

- [ ] `apps/playground/components/demos/<name>-demo.tsx` exists, is self-contained, and imports
      nothing but the registry — it ships verbatim as the docs "Usage" snippet.
- [ ] It is registered in `demos/index.ts` under the **registry item name**, with kebab-case keys
      quoted. A mismatch here silently breaks the docs preview rather than failing the build.
- [ ] The demo shows the variants and sizes a reader would want to see, and fits a phone-width
      preview frame (the docs render it in a narrow iframe).
- [ ] The component is rendered in `apps/playground/app/index.tsx` too.

## Build and verify

```bash
bun run typecheck
bun run build:registry && bun run build:demos && bun run build:preview
bun run playground
```

- [ ] `typecheck` passes.
- [ ] `build:registry` passes — it validates that every `registryDependencies` entry resolves, and
      fails rather than shipping a registry the CLI cannot install.
- [ ] Verified on iOS, Android **and** web. `Modal`, shadows, blur and keyboard behaviour differ
      per platform; one platform looking right says nothing about the other two.
- [ ] Verified in both themes — `Uniwind.setTheme('dark')` in the playground.
- [ ] The generated `public/r/<name>.json` in `magic-native-ui-docs` contains the file content you
      expect. Its imports stay as `@/registry/...` — the CLI rewrites them on install. It is
      `public/r/demos/<name>.json` that should read `@/components/ui/...` and `@/lib/...`.
