import * as React from 'react'
import { Animated, Easing, type ViewProps } from 'react-native'
import { withUniwind } from 'uniwind'

import { cn } from '@/registry/lib/utils'

const AnimatedView = withUniwind(Animated.View)

/**
 * `animate-pulse` has no native equivalent, so the pulse is driven by the
 * Animated API. The explicit `style` is merged after the class-derived styles,
 * so it only controls opacity.
 */
function Skeleton({ className, ...props }: ViewProps) {
  const opacity = React.useRef(new Animated.Value(0.5)).current

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )

    pulse.start()

    return () => pulse.stop()
  }, [opacity])

  return <AnimatedView style={{ opacity }} className={cn('rounded-md bg-muted', className)} {...props} />
}

export { Skeleton }
