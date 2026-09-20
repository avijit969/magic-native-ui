# Theme tokens

Source: `registry/themes/default.css`, shipped to a consumer's project as `theme.css` by
`magic-native-ui init`. It is imported by the playground's `global.css` and by a consumer's
Tailwind entry stylesheet, so the registry and every project using it style from the same values.

## How they are declared

Variables live directly in the `--color-*` namespace, which is what makes Tailwind generate the
matching utilities: `--color-primary` produces `bg-primary`, `text-primary`, `border-primary`.

```css
@layer theme {
  :root {
    @variant light { --color-background: oklch(1 0 0); /* … */ }
    @variant dark  { --color-background: oklch(0.145 0 0); /* … */ }
  }
}

@theme {
  --radius: 0.625rem;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

Both themes are always present; Uniwind picks one at runtime. There is no `.dark` class, so a
`dark:` utility has nothing to hang off — write the token utility and let the theme resolve it.

## The tokens

Colours come in `x` / `x-foreground` pairs. The rule is simple and worth holding onto: anything
placed on `bg-x` uses `text-x-foreground`. Getting this pairing right is most of what makes a
component legible in both themes without a single `dark:` utility.

| Token | Utilities | Use for |
| --- | --- | --- |
| `background` / `foreground` | `bg-background`, `text-foreground` | the screen itself and its default text |
| `card` / `card-foreground` | `bg-card`, `text-card-foreground` | raised surfaces — cards, sheets, list rows |
| `popover` / `popover-foreground` | `bg-popover`, `text-popover-foreground` | transient surfaces over content — dialogs, menus |
| `primary` / `primary-foreground` | `bg-primary`, `text-primary-foreground` | the main action |
| `secondary` / `secondary-foreground` | `bg-secondary`, `text-secondary-foreground` | a supporting action |
| `muted` / `muted-foreground` | `bg-muted`, `text-muted-foreground` | de-emphasised fills and secondary text |
| `accent` / `accent-foreground` | `bg-accent`, `text-accent-foreground` | hover/press fills on otherwise flat elements |
| `destructive` / `destructive-foreground` | `bg-destructive`, `text-destructive-foreground` | delete and other irreversible actions |
| `border` | `border-border` | separators and outlines |
| `input` | `border-input`, `bg-input` | form field borders, and the off track of a switch |
| `ring` | `ring-ring` | focus rings |

Radius: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, all derived from `--radius` so a
consumer can retheme corner rounding with one variable.

## Choosing tokens

- Never hardcode a colour. `bg-white` is correct in exactly one theme, and the component will be
  read in both.
- Use `muted-foreground` for supporting text, not an opacity on `foreground` — opacity stacks
  badly with `disabled:opacity-50`.
- `disabled:opacity-50` is the registry-wide convention for the disabled look. Put it in a cva
  base string rather than a variant, so it applies regardless of variant.
- Press feedback is `active:opacity-90` on filled surfaces and `active:bg-accent` on flat ones.
  Match whichever neighbouring component is closest in shape.
- `input` reads as a border token but is also the "empty track" fill — `switch.tsx` uses
  `data-[state=unchecked]:bg-input`.

## Adding a token

Adding one means every consumer must re-run `init` or hand-edit their `theme.css`, so it is a
breaking change for installed projects. Before adding, check whether an existing pair already
means what you need. If a token really is missing:

1. Add it to **both** `@variant light` and `@variant dark` in `registry/themes/default.css`.
2. Re-run `bun run build:registry` so the `theme` registry item picks it up.
3. Say so in the change description — this is the kind of change that needs to reach people who
   installed components months ago.

## Base colours

`magic-native-ui init --base-color` accepts `neutral`, `slate`, `stone`, `zinc` or `gray`, and
records the answer in `components.json` under `tailwind.baseColor`.

Worth knowing before you promise anything to a user: the CLI writes the stylesheet from the
registry's `theme` item, which is the `neutral` palette, regardless of which base colour was
chosen. The stored value is a recorded preference, not yet a switch — only one palette ships
today. Serving the other four would mean adding more `registry:theme` items and having `init`
fetch the one named by `baseColor`.

None of that reaches components either way. Component classes name semantic tokens, never a base
colour, which is what keeps the choice a consumer's to make.
