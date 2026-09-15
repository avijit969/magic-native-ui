import { Pressable, View, type GestureResponderEvent } from 'react-native'

import { cn } from '@/registry/lib/utils'

type SwitchProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/**
 * `group-*` variants are a Uniwind Pro feature, so the thumb reads the checked
 * state from its own `data-state` prop rather than from the root.
 */
function Switch({
  className,
  checked,
  onCheckedChange,
  disabled,
  onPress,
  ...props
}: SwitchProps) {
  const state = checked ? 'checked' : 'unchecked'

  function handlePress(event: GestureResponderEvent) {
    onCheckedChange(!checked)
    onPress?.(event)
  }

  return (
    <Pressable
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled ?? undefined}
      aria-valuetext={checked ? 'on' : 'off'}
      disabled={disabled}
      onPress={handlePress}
      data-state={state}
      className={cn(
        'h-6 w-11 shrink-0 flex-row items-center rounded-full border-2 border-transparent px-0.5',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        'disabled:opacity-50',
        className
      )}
      {...props}
    >
      <View
        role="presentation"
        data-state={state}
        className={cn(
          'h-5 w-5 rounded-full bg-background shadow',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </Pressable>
  )
}

export { Switch }
export type { SwitchProps }
