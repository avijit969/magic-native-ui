# Component patterns

The shapes that recur across `registry/ui/`. Follow the one that fits rather than inventing a
variation — a consumer reading two of these files should find the same skeleton in both.

## Contents

- [File skeleton](#file-skeleton)
- [Variants with cva](#variants-with-cva)
- [The text-class contract](#the-text-class-contract)
- [Compound components with context](#compound-components-with-context)
- [Controlled and uncontrolled in one component](#controlled-and-uncontrolled-in-one-component)
- [State without `group-*`](#state-without-group-)
- [`asChild`](#aschild)
- [Anchored overlays](#anchored-overlays)
- [Icons inside a component](#icons-inside-a-component)
- [Platform differences](#platform-differences)

## File skeleton

Import order across the registry is: React, then React Native, then third-party, then `@/registry`
paths. Exports go at the bottom, values and types on separate lines.

```tsx
import * as React from 'react'
import { Pressable } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'

import { TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

const thingVariants = cva('base classes', { variants: { /* … */ }, defaultVariants: { /* … */ } })

type ThingProps = React.ComponentProps<typeof Pressable> & VariantProps<typeof thingVariants>

function Thing({ className, variant, ...props }: ThingProps) {
  return <Pressable className={cn(thingVariants({ variant }), className)} {...props} />
}

export { Thing, thingVariants }
export type { ThingProps }
```

Notes that are easy to get wrong:

- Props extend `React.ComponentProps<typeof Pressable>` (or `View`, `TextInput`, …) so callers
  keep every native prop, including the accessibility ones.
- `{...props}` goes **last** so a caller can override anything the component set — except
  `className`, which is already merged through `cn()` above.
- Export the cva object. Consumers compose with it, and it costs nothing.
- `function` declarations, not `const` arrow components. That is what the rest of the registry
  uses, and named functions give better stacks.

## Variants with cva

Mirror shadcn/ui's variant names exactly — `default`, `destructive`, `outline`, `secondary`,
`ghost`, `link` for actions; `default`, `sm`, `lg`, `icon` for sizes. Someone porting a web screen
should not have to learn new names.

```tsx
const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 rounded-md disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary active:opacity-90',
        outline: 'border border-input bg-background active:bg-accent',
        // …
      },
      size: {
        default: 'h-10 px-4 py-2',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
```

The base string carries layout and shared state (`flex-row`, `disabled:opacity-50`); variants
carry only what differs. Always provide `defaultVariants`, so `<Button />` with no props renders.

## The text-class contract

Any component that contains text needs a second cva object for the text, and must provide it
through `TextClassContext`:

```tsx
const buttonTextVariants = cva('text-sm font-medium', {
  variants: {
    variant: { default: 'text-primary-foreground', outline: 'text-foreground', /* … */ },
    size: { default: '', lg: 'text-base', /* … */ },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

<TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
  <Pressable … />
</TextClassContext.Provider>
```

Keep the variant keys identical between the two objects — including the ones that map to an empty
string. A missing key is a TypeScript error waiting for the next variant to be added, and the
empty strings document that the size deliberately does not change the text.

## Compound components with context

For anything with parts (`Dialog`/`DialogTrigger`/`DialogContent`, `Card`/`CardHeader`/…), share
state through a private context with a guarded hook:

```tsx
const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext(name: string) {
  const context = React.useContext(DialogContext)

  if (!context) {
    throw new Error(`<${name} /> must be rendered inside a <Dialog />`)
  }

  return context
}
```

The `name` argument is what makes the error useful — it names the part that was misplaced, not the
hook. Export every part from the same file, in render order, so one `add dialog` gives a consumer
the whole set. Parts that hold no state (`CardHeader`) are just styled `View`s and need no context.

## Controlled and uncontrolled in one component

Follow `Dialog`: the prop wins when present, internal state otherwise, and the callback fires
either way.

```tsx
function Dialog({ open: openProp, defaultOpen = false, onOpenChange, ...props }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) {
        setUncontrolledOpen(next)
      }

      onOpenChange?.(next)
    },
    [openProp, onOpenChange]
  )
  // …
}
```

Checking `openProp === undefined` rather than a stored "is controlled" flag keeps the component
correct if a caller switches modes. Some components are deliberately controlled-only — `Switch`
requires `checked` and `onCheckedChange`, because a toggle whose state you cannot read is rarely
what anyone wants. Either is fine; just be deliberate and let the types say which.

## State without `group-*`

Derive one state string and hand it to every node that reacts to it:

```tsx
const state = checked ? 'checked' : 'unchecked'
```

Then `data-state={state}` on each, with explicit classes for both values. Use `data-state` for
the common open/closed, checked/unchecked pair; a component with an unrelated axis can add its
own (`data-orientation`, `data-side`). Also set the matching `aria-*` prop — `data-*` drives
pixels, `aria-*` drives screen readers, and they are not interchangeable.

## `asChild`

See rule 8 in `conventions.md` for `PressableSlot` and the two ordering decisions inside it. Add
`asChild` only to triggers and closers — the places where a caller legitimately wants their own
`Button` to be the thing that opens or closes something.

## Anchored overlays

Anything that hangs off a trigger — popover, dropdown menu, context menu, and a select or tooltip
when they arrive — follows one shape, because React Native has neither a portal nor a popper.

1. **Measure the trigger** with `measureAnchor(ref)` from `registry/lib/anchor.ts`, on open rather
   than on mount. A trigger inside a list that has scrolled has moved since it mounted.
2. **Render into a `Modal`.** It lifts the content above the tree the way a portal does, closes on
   the Android back button, and needs no host component at the app root.
3. **Lay out invisibly, then position.** The content's size is unknown until it has been laid out,
   so it renders at `opacity: 0`, reports its size through `onLayout`, and only then gets a
   position. Skip this and the first frame is drawn at the top left corner and visibly jumps.
4. **Place it with `positionContent`**, which flips to the opposite side when the preferred one
   cannot fit and clamps the result inside the window.

```tsx
const position =
  anchor && size
    ? positionContent({ anchor, content: size, window, side, align, offset: sideOffset })
    : null

<View
  onLayout={handleLayout}
  // Absolute placement is measured in pixels, which no class can carry.
  style={
    position
      ? { position: 'absolute', top: position.top, left: position.left }
      : { position: 'absolute', opacity: 0 }
  }
  className={cn('z-50 rounded-md border border-border bg-popover shadow-md', className)}
/>
```

Two deliberate choices worth keeping. The positioning maths lives in `lib/anchor` rather than in
each component, because flipping and clamping are the parts that go subtly wrong and four copies
would drift. The `Modal` block, by contrast, is repeated in each component — it is plain
boilerplate, and a stranger reading one copied file should not have to open another to understand
how the overlay is mounted.

`registry/ui/popover.tsx` is the smallest complete example. `context-menu.tsx` shows the variation
where the anchor is a touch point rather than an element: `rectFromPoint(pageX, pageY)` from the
long-press event, since React Native has no secondary click on any platform.

## Icons inside a component

Wrap at module scope and use the registry's helper:

```tsx
import { X } from 'lucide-react-native'
import { iconWithClassName } from '@/registry/lib/icons'

const XIcon = iconWithClassName(X)
```

If a component ships with an icon baked in (as `DialogContent` does with its close button), add
`lucide-react-native` and `react-native-svg` to its `dependencies` **and** `icons` to its
`registryDependencies` in `registry.json`. Otherwise it installs into a project that cannot
resolve the import.

## Platform differences

The three platforms diverge in places that look like styling but are not. Check these before
declaring a component done:

| Concern | What differs |
| --- | --- |
| `Modal` | Android back button closes it; iOS needs an explicit dismiss; web renders in place |
| Shadows | `shadow-*` maps to `elevation` on Android and to a box shadow on web; results differ |
| Blur (`expo-blur`) | No-op in some web contexts; always give it a solid fallback background |
| Keyboard | `TextInput` focus and avoidance behave differently per platform |
| Text measurement | Line heights and font metrics differ; do not pixel-match iOS on Android |
| Touch targets | 44pt minimum on iOS, 48dp on Android — size the `Pressable`, not just the icon |

`Platform.select()` is available when a genuine difference needs different values. Prefer classes
that work everywhere; reach for `Platform` only when the platform behaviour, not the taste,
differs — and leave a comment saying which platform needed it.
