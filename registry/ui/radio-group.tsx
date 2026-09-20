import * as React from 'react'
import { Pressable, View, type GestureResponderEvent, type ViewProps } from 'react-native'

import { cn } from '@/registry/lib/utils'

type RadioGroupContextValue = {
  value: string | undefined
  onValueChange: (value: string) => void
  disabled: boolean | undefined
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

function useRadioGroupContext(name: string) {
  const context = React.useContext(RadioGroupContext)

  if (!context) {
    throw new Error(`<${name} /> must be rendered inside a <RadioGroup />`)
  }

  return context
}

type RadioGroupProps = ViewProps & {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

function RadioGroup({ className, value, onValueChange, disabled, ...props }: RadioGroupProps) {
  const handleValueChange = React.useCallback(
    (next: string) => {
      onValueChange?.(next)
    },
    [onValueChange]
  )

  const context = React.useMemo(
    () => ({ value, onValueChange: handleValueChange, disabled }),
    [value, handleValueChange, disabled]
  )

  return (
    <RadioGroupContext.Provider value={context}>
      <View role="radiogroup" className={cn('gap-2', className)} {...props} />
    </RadioGroupContext.Provider>
  )
}

type RadioGroupItemProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
  value: string
}

/**
 * The dot reads the checked state from its own `data-state`, because `group-*`
 * variants are a Uniwind Pro feature and are not available here.
 */
function RadioGroupItem({
  className,
  value,
  disabled,
  onPress,
  ...props
}: RadioGroupItemProps) {
  const group = useRadioGroupContext('RadioGroupItem')
  const checked = group.value === value
  const isDisabled = disabled ?? group.disabled
  const state = checked ? 'checked' : 'unchecked'

  function handlePress(event: GestureResponderEvent) {
    group.onValueChange(value)
    onPress?.(event)
  }

  return (
    <Pressable
      role="radio"
      aria-checked={checked}
      aria-disabled={isDisabled ?? undefined}
      disabled={isDisabled}
      onPress={handlePress}
      data-state={state}
      className={cn(
        'h-5 w-5 items-center justify-center rounded-full border border-primary',
        'disabled:opacity-50',
        className
      )}
      {...props}
    >
      <View
        role="presentation"
        data-state={state}
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          'data-[state=checked]:bg-primary data-[state=unchecked]:bg-transparent'
        )}
      />
    </Pressable>
  )
}

export { RadioGroup, RadioGroupItem }
export type { RadioGroupItemProps, RadioGroupProps }
