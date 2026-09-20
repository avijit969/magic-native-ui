---
name: magic-native-ui-component
description: >-
  Build, edit, port or review a Magic Native UI component in registry/ui/*.tsx.
  Covers the React Native + Uniwind rules that make this registry different from
  shadcn/ui on the web (TextClassContext instead of CSS inheritance, data-*
  instead of group-*, active:/disabled: instead of hover:, cva variants, asChild
  by cloning instead of a Radix slot, withUniwind at module scope) and the full
  pipeline for landing a new component: source file, playground demo, gallery
  entry, registry.json entry, build scripts, verification on iOS, Android and
  web. Use this skill whenever the work touches a component in this registry —
  including requests that only name the component ("add a slider", "port
  shadcn's accordion", "the switch thumb sits wrong on Android", "review my card
  changes") and never mention Uniwind, the registry or React Native.
---

# Magic Native UI — components

This repo is a registry, not a library. Every file in `registry/ui/` is copied verbatim into
someone else's app by the CLI and owned by them from that point on. That single fact drives
everything below: a component has to be readable by a stranger, self-contained, and free of
anything that only works inside this workspace.

## Before writing code

Read the component closest to what you are building. The existing set already answers most
questions, and matching it matters more than any rule here.

| If you need | Read |
| --- | --- |
| cva variants + text colour through context | `registry/ui/button.tsx` |
| compound parts sharing state through context | `registry/ui/dialog.tsx` |
| `asChild` without a Radix slot | `PressableSlot` in `registry/ui/dialog.tsx` |
| child styling from parent state, no `group-*` | `registry/ui/switch.tsx` |
| controlled + uncontrolled in one component | `Dialog` in `registry/ui/dialog.tsx` |
| a deliberate inline `style` escape hatch | `registry/ui/skeleton.tsx` |
| the text primitive everything nests inside | `registry/ui/text.tsx` |

## The eight rules

React Native is not the web. These are the differences that have actually broken components
here. The reasoning matters more than the rule, because most of these bugs are a web habit
applied where it silently does nothing — no error, just a component that looks wrong.

1. **No CSS inheritance.** A `<Text>` inside a `<Button>` cannot inherit the button's colour;
   RN resolves each node's style on its own. Components publish their text classes through
   `TextClassContext` (`registry/ui/text.tsx`) instead, which is why labels are wrapped in
   `<Text>` rather than passed as a string prop.
2. **No `group-*`.** Those variants are a Uniwind Pro feature. A child reads state from its own
   `data-*` prop — set the same `data-state` on both root and child, the way `switch.tsx` does.
3. **No `hover:`, `before:`, `after:` or `grid-*`.** Use `active:` and `disabled:` for state and
   flexbox for layout. RN's flex direction defaults to `column`, so a row needs an explicit
   `flex-row`; a web habit gives you a stacked layout with no error.
4. **Inline `style` always beats `className`.** Never spread a caller's `style` over a
   component's own classes — it silently wins and there is no specificity to argue with.
   `skeleton.tsx` passes one deliberately, for animated opacity only, and says so in a comment.
5. **Wrap with `withUniwind()` at module scope.** Anything that is not an RN core component —
   every Lucide icon, every `react-native-svg` element — needs it. Wrapping inside a render
   function rebuilds the wrapper on each render and remounts the subtree. Building on core
   components avoids the question entirely.
6. **Themes are `@variant` blocks, not a `.dark` class.** See `registry/themes/default.css`.
   Switch at runtime with `Uniwind.setTheme('dark' | 'light' | 'system')`. Never write a `dark:`
   utility expecting a class toggle to drive it.
7. **Never forward a `className` the caller did not pass.** `className={className}` sends
   `undefined` into Uniwind and styleq rejects it at runtime. Run the value through `cn()`, or
   spread the props and let it land naturally.
8. **No Radix slot.** `asChild` is implemented by cloning the single child where it is needed.
   The child's own props win and its handler runs first — see `PressableSlot`.

`references/conventions.md` gives each rule a failure mode and a correct/incorrect pair. Read it
when a rule's consequence is not obvious, or when reviewing someone else's component.

## Adding a new component

Five steps, in this order. Steps 2 and 3 are not optional extras — the docs site reads them.

1. **`registry/ui/<name>.tsx`** — kebab-case file name matching the registry item name. Import
   through `@/registry/...` aliases; `build-demos.ts` and the CLI rewrite those to a consumer's
   aliases on the way out. Export the component, its `*Variants` cva objects and its props type.
2. **`apps/playground/components/demos/<name>-demo.tsx`** — one self-contained example, then
   register it in `apps/playground/components/demos/index.ts` keyed by the **registry item
   name**, quoting the key when it is kebab-case. That key is what makes `preview/<name>` line
   up with `magic-native-ui add <name>`. The file ships verbatim as the docs "Usage" snippet, so
   it must import nothing but the registry and read well on its own — no shared helpers.
3. **`apps/playground/app/index.tsx`** — render it in the gallery so the combined screen covers
   it too.
4. **`registry.json`** — add the item with its npm `dependencies` and `registryDependencies`.
   Getting that list wrong is the most common way to ship a component that installs broken; the
   `magic-native-ui-registry` skill has the schema and the dependency rules.
5. **Build and verify:**
   ```bash
   bun run typecheck
   bun run build:registry && bun run build:demos && bun run build:preview
   ```
   Then `bun run playground` and check iOS, Android and web. Nothing here is cross-platform by
   assumption — `Modal`, blur, shadows and keyboard behaviour all differ per platform.

No docs-site change is needed. `magic-native-ui-docs` generates component pages, the sidebar and
the pager from `public/r/*.json`, so those build scripts are the entire handoff.

## Porting a shadcn/ui component

Take the variant structure and the token names, drop the DOM. The usual translation:

| Web | Here |
| --- | --- |
| `<button>` / Radix primitive | `Pressable` |
| `<div>` | `View` |
| bare text node | `<Text>` from `registry/ui/text.tsx` |
| Radix `asChild` | clone the child, as `PressableSlot` does |
| Radix context primitives | `React.createContext` + a `use*Context(name)` guard that throws |
| `hover:` | `active:` |
| `group-data-[state=open]:` | `data-state` set on the child itself |
| portal / popper | `Modal`, or absolute positioning inside the tree |

Keep shadcn's prop names and variant names. Someone arriving from the web should be able to
guess the API, and that familiarity is most of this registry's value.

## Accessibility

RN's own accessibility props are the behaviour layer here — no primitives library is supplying
roles. Set `role`, plus the `aria-*` props the platform maps (`aria-checked`, `aria-disabled`,
`aria-valuetext`, `aria-label`), the way `switch.tsx` does. A `Pressable` with no role is
invisible to screen readers on both platforms.

## Reviewing a component

Work through `references/review-checklist.md`. It is ordered by how often each item is actually
wrong, and it is aimed at the silent failures: a `className` that never applies, a `flex-row`
that was assumed, a demo key that does not match the registry name.

## Reference files

- `references/conventions.md` — the eight rules with failure modes and code pairs.
- `references/patterns.md` — cva variants, context-based compound components, controlled and
  uncontrolled state, `asChild`, `data-*` state, the text-class contract.
- `references/tokens.md` — every theme token and the utilities it generates.
- `references/review-checklist.md` — pre-merge checklist for a new or changed component.
