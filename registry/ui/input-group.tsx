import * as React from 'react'
import { View, type ViewProps } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'

import { Input, type InputProps } from '@/registry/ui/input'
import { TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

const inputGroupVariants = cva('w-full flex-row items-center gap-2', {
  variants: {
    variant: {
      default: 'rounded-md border border-input bg-background',
      filled: 'rounded-md border border-transparent bg-muted',
      underline: 'rounded-none border-b border-input bg-transparent',
    },
    size: {
      sm: 'h-9 px-2.5',
      default: 'h-10 px-3',
      lg: 'h-12 px-4',
    },
  },
  compoundVariants: [{ variant: 'underline', class: 'px-0' }],
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

type Size = NonNullable<VariantProps<typeof inputGroupVariants>['size']>

type InputGroupContextValue = {
  size: Size
  setFocused: (focused: boolean) => void
}

const InputGroupContext = React.createContext<InputGroupContextValue | null>(null)

function useInputGroup() {
  const context = React.useContext(InputGroupContext)

  if (!context) {
    throw new Error('InputGroup parts must be rendered inside an <InputGroup>.')
  }

  return context
}

type InputGroupProps = ViewProps &
  VariantProps<typeof inputGroupVariants> & {
    invalid?: boolean
  }

/**
 * The border lives on this container rather than on the field, so `focus:`
 * — which only ever fires on the focused element — cannot style it. The
 * nested input reports focus up through context instead.
 */
function InputGroup({ className, variant, size, invalid, ...props }: InputGroupProps) {
  const [focused, setFocused] = React.useState(false)
  const value = React.useMemo<InputGroupContextValue>(
    () => ({ size: size ?? 'default', setFocused }),
    [size]
  )

  return (
    <InputGroupContext.Provider value={value}>
      <View
        className={cn(
          inputGroupVariants({ variant, size }),
          focused && 'border-ring',
          invalid && 'border-destructive',
          className
        )}
        {...props}
      />
    </InputGroupContext.Provider>
  )
}

/** The field itself — unstyled, because the group draws the frame. */
function InputGroupInput({ className, onFocus, onBlur, ...props }: InputProps) {
  const { size, setFocused } = useInputGroup()

  return (
    <Input
      variant="unstyled"
      size={size}
      className={cn('h-full flex-1', className)}
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      {...props}
    />
  )
}

/** Anything beside the field: an icon, a unit, a button. */
function InputGroupAddon({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-sm text-muted-foreground">
      <View className={cn('flex-row items-center gap-1.5', className)} {...props} />
    </TextClassContext.Provider>
  )
}

export { InputGroup, InputGroupAddon, InputGroupInput, inputGroupVariants }
export type { InputGroupProps }
