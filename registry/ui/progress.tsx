import { View, type ViewProps } from 'react-native'

import { cn } from '@/registry/lib/utils'

type ProgressProps = ViewProps & {
  /** 0 to 100. Values outside that range are clamped rather than overflowing. */
  value?: number
  /** Classes for the filled portion, since it is not the element you pass `className` to. */
  indicatorClassName?: string
}

function Progress({ className, value = 0, indicatorClassName, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <View
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <View
        role="presentation"
        // The fill is a fraction of the track, which no utility class can carry.
        style={{ width: `${clamped}%` }}
        className={cn('h-full rounded-full bg-primary', indicatorClassName)}
      />
    </View>
  )
}

export { Progress }
export type { ProgressProps }
