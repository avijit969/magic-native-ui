import { Check } from 'lucide-react-native'
import { Pressable, View, type GestureResponderEvent } from 'react-native'

import { iconWithClassName } from '@/registry/lib/icons'
import { cn } from '@/registry/lib/utils'

const CheckIcon = iconWithClassName(Check)

type CheckboxProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function Checkbox({
  className,
  checked,
  onCheckedChange,
  disabled,
  onPress,
  ...props
}: CheckboxProps) {
  function handlePress(event: GestureResponderEvent) {
    onCheckedChange(!checked)
    onPress?.(event)
  }

  return (
    <Pressable
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled ?? undefined}
      disabled={disabled}
      onPress={handlePress}
      data-state={checked ? 'checked' : 'unchecked'}
      className={cn(
        'h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary',
        'data-[state=checked]:bg-primary',
        'disabled:opacity-50',
        className
      )}
      {...props}
    >
      {checked ? (
        <View role="presentation" className="h-full w-full items-center justify-center">
          <CheckIcon size={12} className="text-primary-foreground" />
        </View>
      ) : null}
    </Pressable>
  )
}

export { Checkbox }
export type { CheckboxProps }
