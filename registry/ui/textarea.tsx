import { TextInput } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/registry/lib/utils'

const textareaVariants = cva('w-full px-3 py-2 text-base text-foreground', {
  variants: {
    variant: {
      default: 'rounded-md border border-input bg-background focus:border-ring',
      filled: 'rounded-md border border-transparent bg-muted focus:border-ring',
      ghost: 'rounded-md border border-transparent bg-transparent focus:bg-muted',
    },
    // A minimum rather than a fixed height, so `className` can still grow it.
    size: {
      sm: 'min-h-16',
      default: 'min-h-24',
      lg: 'min-h-36',
    },
    invalid: {
      true: 'border-destructive focus:border-destructive',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    invalid: false,
  },
})

type TextareaProps = Omit<React.ComponentProps<typeof TextInput>, 'size'> &
  VariantProps<typeof textareaVariants>

function Textarea({
  className,
  variant,
  size,
  invalid,
  editable,
  readOnly,
  ...props
}: TextareaProps) {
  // `TextInput` has no `disabled` prop, so the `disabled:` variant never fires
  // on it — the dimming is applied from the props that do turn a field off.
  const off = editable === false || readOnly === true

  return (
    <TextInput
      multiline
      editable={editable}
      readOnly={readOnly}
      aria-invalid={invalid ?? undefined}
      // Android centres multiline text vertically without this.
      textAlignVertical="top"
      className={cn(textareaVariants({ variant, size, invalid }), off && 'opacity-50', className)}
      // Colour props are resolved from `accent-*` utilities, not `text-*`.
      placeholderTextColorClassName="accent-muted-foreground"
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
export type { TextareaProps }
