# Conventions, with the failure each one prevents

Every rule here exists because the web version of the same code fails silently on native. There
is no console warning for most of them — the component simply renders wrong, and usually only on
one of the three platforms. Read the "what actually happens" line before the code; that is the
part worth remembering.

## 1. No CSS inheritance — publish text classes through context

**What actually happens:** the label renders in the default foreground colour on a dark button,
so it is invisible against `bg-primary`. No error.

React Native resolves each node's style independently. There is no cascade, so a `<Text>` nested
inside a styled `<Pressable>` knows nothing about it.

```tsx
// Wrong — the colour never reaches the label.
<Pressable className="bg-primary">
  <Text>Save</Text>
</Pressable>

// Right — the parent publishes its text classes, Text reads them.
<TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
  <Pressable className={cn(buttonVariants({ variant, size }), className)} {...props} />
</TextClassContext.Provider>
```

`registry/ui/text.tsx` is the other half of the contract:

```tsx
function Text({ className, ...props }: React.ComponentProps<typeof RNText>) {
  const textClass = React.useContext(TextClassContext)

  return <RNText className={cn('text-base text-foreground', textClass, className)} {...props} />
}
```

The ordering matters: base classes, then the context value, then the caller's `className`, so a
caller can always override. This is also why the public API is
`<Button><Text>Save</Text></Button>` rather than a `label` string prop — the `<Text>` is the
thing that reads the context.

A component that has text inside it needs a `*TextVariants` cva object beside its
`*Variants` one. Keep them in the same file and export both.

## 2. No `group-*` — children read their own `data-*`

**What actually happens:** `group-data-[state=checked]:translate-x-5` compiles to nothing, so the
switch thumb never moves. The switch looks permanently off.

`group-*` is a Uniwind Pro feature and is not available here. Set the same state on the child and
let it style itself:

```tsx
const state = checked ? 'checked' : 'unchecked'

<Pressable
  data-state={state}
  className={cn('data-[state=checked]:bg-primary data-[state=unchecked]:bg-input', className)}
>
  <View
    data-state={state}
    className="data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
  />
</Pressable>
```

Always give both sides of a boolean an explicit class (`checked:` **and** `unchecked:`) rather
than relying on an unstyled default. Uniwind does not remove a previously applied utility when
the data attribute changes unless a competing utility replaces it.

## 3. No `hover:`, `before:`, `after:` or `grid-*`

**What actually happens:** `hover:bg-accent` does nothing on a phone and inconsistently something
on web, so pressed feedback is missing exactly where it is needed.

- Interaction state is `active:` (RN's pressed state) and `disabled:`.
- There is no pseudo-element, so a decorative bar or a checkmark is a real `<View>`.
- Layout is flexbox only. RN defaults `flexDirection` to `column`, so **every row needs an
  explicit `flex-row`** — the most common silent layout bug in this repo.

```tsx
// Wrong on native
'hover:bg-accent grid grid-cols-2'

// Right
'active:bg-accent flex-row'
```

## 4. Inline `style` beats `className` — never spread a caller's style

**What actually happens:** a caller passes `style={{ backgroundColor: 'red' }}` and it wins over
every variant class, with no way for the component to reassert itself.

Uniwind compiles classes into styles that are merged below any inline `style`, and RN has no
specificity model to appeal to. So a component must not pass a caller's `style` through on top of
its own classes as though the two compose.

`registry/ui/skeleton.tsx` is the one deliberate exception: it passes an inline style for the
animated opacity, because an animated value cannot be expressed as a class. It carries a comment
saying so. If you need a second exception, comment it the same way.

## 5. `withUniwind()` at module scope

**What actually happens:** wrapping inside render produces a new component type on every render,
so React unmounts and remounts the subtree — state loss, restarted animations, a visible flash.

```tsx
// Wrong — new type each render
function Row() {
  const StyledHeart = withUniwind(Heart)
  return <StyledHeart className="text-primary" />
}

// Right — module scope, once
const HeartIcon = iconWithClassName(Heart)

function Row() {
  return <HeartIcon className="text-primary" size={16} />
}
```

Anything that is not an RN core component needs the wrapper for `className` to do anything.
`registry/lib/icons.tsx` wraps Lucide icons by mapping `className` onto their `color` prop;
`registry/lib/hugeicons/icon.tsx` does the same for the root `<Svg>`. Reuse those helpers rather
than calling `withUniwind` directly — and prefer building on core components, where the question
does not come up at all.

## 6. Themes are `@variant` blocks

**What actually happens:** `dark:bg-card` does nothing, because there is no `.dark` class being
toggled anywhere.

Uniwind resolves themes through `@variant` blocks inside `@layer theme`, not through a class on a
root element. Write token utilities (`bg-card`, `text-foreground`) and let the theme supply the
value for the active mode. `registry/themes/default.css` declares both `light` and `dark`; runtime
switching is `Uniwind.setTheme('dark' | 'light' | 'system')`.

A component should almost never name a theme explicitly. If you find yourself wanting `dark:`,
the answer is usually a token that already differs between themes — see `references/tokens.md`.

## 7. Never forward a `className` the caller did not pass

**What actually happens:** `undefined` reaches styleq and it throws at runtime, so the screen is
blank rather than slightly wrong. This one is loud, and it only fires when a caller omits the
prop — which is exactly what a demo or a test tends to do.

```tsx
// Wrong — undefined when the caller omits className
<View className={className} />

// Right — cn() drops the undefined
<View className={cn('rounded-lg bg-card', className)} />

// Also right — the prop simply is not there
function Thing({ ...props }) {
  return <View {...props} />
}
```

Destructuring `className` and then forwarding it bare is the trap: once you pull it out of
`props`, you own the `undefined` case.

## 8. No Radix slot — `asChild` clones the child

**What actually happens:** without this, `<DialogTrigger asChild><Button/></DialogTrigger>`
renders a `Pressable` wrapping a `Pressable`, giving a double tap target and a doubled press.

```tsx
function PressableSlot({ asChild, children, ...props }: PressableProps & { asChild?: boolean }) {
  if (!asChild) {
    return <Pressable {...props}>{children}</Pressable>
  }

  const child = React.Children.only(children) as React.ReactElement<PressableProps>

  return React.cloneElement(child, {
    ...props,
    ...child.props,
    onPress: (event: GestureResponderEvent) => {
      child.props.onPress?.(event)
      props.onPress?.(event)
    },
  })
}
```

Two decisions worth keeping when you copy this: the child's props are spread **after** the slot's,
so the caller wins; and the child's `onPress` runs **before** the slot's, so a caller's handler
cannot be skipped by the dialog closing first. `React.Children.only` gives a clear error instead
of silently dropping extra children.

Implement `asChild` only where a component genuinely needs to hand its behaviour to a caller's
element — triggers and closers. Do not add it everywhere for symmetry with Radix.
