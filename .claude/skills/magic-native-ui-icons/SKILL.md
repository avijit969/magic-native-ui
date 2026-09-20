---
name: magic-native-ui-icons
description: >-
  Work with icons in Magic Native UI — the two supported sets and when each
  applies. Covers Lucide via iconWithClassName (className mapped onto the color
  prop) for icons baked into components, and the vendored Hugeicons pipeline
  (build:icons sharding the 6.18 MB upstream barrel, magic-native-ui icon add
  copying named icons into lib/hugeicons/icons.ts, registry names vs upstream
  exports vs aliases). Use this skill when adding or rendering an icon, when an
  icon ignores its className or renders black, when regenerating the icon index
  after a Hugeicons upgrade, when the CLI refuses to write the icons barrel, or
  when choosing between the two icon sets.
---

# Magic Native UI — icons

Two sets, for two different jobs.

| | Lucide | Hugeicons |
| --- | --- | --- |
| How it arrives | npm package `lucide-react-native` | copied into the project, icon by icon |
| Use it for | icons baked into a registry component | icons in a consumer's own screens |
| Rendered by | the Lucide component, wrapped | `<Icon icon={…} />` + `react-native-svg` |
| Cost | whole package installed | only the icons actually named |
| Helper | `registry/lib/icons.tsx` | `registry/lib/hugeicons/` |

A registry component that needs an icon uses **Lucide** — `dialog.tsx` and `checkbox.tsx` both do.
Hugeicons is the browsable set a consumer picks from, with 5,437 free icons that would be absurd
to install wholesale.

## Lucide, inside a component

```tsx
import { X } from 'lucide-react-native'
import { iconWithClassName } from '@/registry/lib/icons'

const XIcon = iconWithClassName(X)          // module scope, once

// …
<XIcon className="text-muted-foreground" size={16} />
```

Lucide icons take a `color` prop, not a class. `iconWithClassName` uses `withUniwind` to map
`className` onto the resolved `color` style, so icon usage reads the same as it does on the web.

Two things go wrong here, both silently:

- **Calling it inside render.** A new component type each render remounts the icon — see rule 5
  in the `magic-native-ui-component` skill's conventions.
- **Skipping the wrapper.** A bare `<X className="text-primary" />` renders in Lucide's default
  colour. Nothing errors; the icon is just the wrong colour.

A component that ships an icon needs `icons` in its `registryDependencies`. That item carries
`lucide-react-native` and `react-native-svg`, so the component does not list them itself.

## Hugeicons, in a consumer's app

```bash
npx magic-native-ui@latest icon list heart     # search by name or alias
npx magic-native-ui@latest icon add heart star # vendor them
```

```tsx
import { Icon, HeartIcon } from '@/lib/hugeicons'

<Icon icon={HeartIcon} size={20} className="text-primary" />
```

The first `icon add` copies the renderer into `lib/hugeicons/`; every run merges the named icons
into `lib/hugeicons/icons.ts`, sorted, deduplicated and keeping what is already there.

`<Icon>` draws with `react-native-svg` on a 24×24 viewBox. Hugeicons strokes with
`currentColor`, which react-native-svg resolves from the root `<Svg>`'s `color` prop — so the same
`withUniwind` mapping makes `className` behave like a colour utility. `size` sets both dimensions;
`strokeWidth` re-strokes only shapes that were already stroked, so filled parts stay filled.

## Naming

Exports keep their upstream Hugeicons name (`HeartIcon`, `Add01Icon`), so anything found in the
Hugeicons docs is the same symbol here. The registry name is its kebab-case form (`heart`,
`add-01`), with the `Icon` suffix dropped.

Upstream ships the same drawing under several export names. The build groups them by shared data,
picks the least-shouting `*Icon` spelling as canonical (`ArrowDownAzIcon` over `ArrowDownAZIcon`
over a bare `ArrowDown`), and turns the rest into searchable aliases — which is why
`icon add plus` resolves to `AddIcon`.

An alias survives only if it is unambiguous: one that shadows a real icon, or that two icons both
claim, is dropped rather than resolving to a coin flip. So an icon can be addressed three ways:
registry name (`heart`), a surviving alias (`plus`), or the export itself (`HeartIcon`).

## Regenerating after a Hugeicons upgrade

```bash
bun run build:icons
```

`@hugeicons/core-free-icons` → `../magic-native-ui-docs/public/r/icons/`: an index of every icon
plus shards of ~250 icons (around 300 KB each). Sharding is what makes `icon add heart` a ~300 KB
fetch instead of pulling the 6.18 MB barrel. The package is a devDependency of this repo only and
never ships to anyone's project.

The script **throws rather than emitting two icons under one registry name**:

```
"x" is claimed by two different icons: XIcon and XFreeIcon
```

That means upstream added a drawing whose canonical name collides. Decide which one owns the name
and adjust `pickCanonical` or `toRegistryName` — do not silence it, because shipping a colliding
index means `icon add x` installs whichever icon won the race.

After regenerating, check the count in `public/r/icons/index.json` against the previous version.
A sharp drop usually means upstream changed its export shape and the grouping stopped matching.

## Troubleshooting

**Icon renders black, or ignores `className`.** Not wrapped. Lucide needs `iconWithClassName`;
Hugeicons needs to go through `<Icon>` rather than a raw `<Svg>`.

**Icon remounts / flickers / loses animation.** `withUniwind` or `iconWithClassName` is being
called inside a render function. Move it to module scope.

**"Cannot resolve react-native-svg".** The consuming project installed a component that uses icons
without the `icons` registry item, or `icon add` was skipped. Both the Lucide helper and the
Hugeicons renderer need `react-native-svg`.

**The CLI refuses to write `lib/hugeicons/icons.ts`.** It regenerates that barrel wholesale, so it
will not overwrite a file containing code of its own. That is deliberate — keep custom exports in
a separate file beside it and re-run.

**An icon name is not found.** Search first: `icon list <term>` covers names and aliases. If the
name exists upstream but not here, it was folded into another export as an alias, or the alias was
dropped as ambiguous — search for the drawing rather than the name.
