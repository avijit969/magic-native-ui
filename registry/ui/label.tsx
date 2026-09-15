import { Text as RNText } from 'react-native'

import { cn } from '@/registry/lib/utils'

type LabelProps = React.ComponentProps<typeof RNText>

/**
 * React Native has no `<label for>`: bind a label to its control by giving the
 * label a `nativeID` and pointing the control's `aria-labelledby` at it. `Text`
 * takes an `onPress` of its own if you want the label to act on the control.
 */
function Label({ className, ...props }: LabelProps) {
  return (
    <RNText
      className={cn('text-sm font-medium leading-none text-foreground', className)}
      {...props}
    />
  )
}

export { Label }
export type { LabelProps }
