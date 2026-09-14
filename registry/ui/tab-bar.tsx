import * as React from 'react'
import {
  Animated,
  PanResponder,
  Pressable,
  View,
  type LayoutRectangle,
  type ViewProps,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { withUniwind } from 'uniwind'

import { Text, TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

const AnimatedView = withUniwind(Animated.View)
const GlassView = withUniwind(BlurView)

/**
 * Damped just short of bouncing: the pill should look heavy and settle in one
 * move, not spring past the tab and come back.
 */
const SPRING = { stiffness: 220, damping: 26, mass: 1, useNativeDriver: false } as const

/** How far the pill stretches along its direction of travel while held. */
const STRETCH = 1.06

/** Movement, in points, before a press on a tab turns into a slide. */
const SLIDE_THRESHOLD = 4

type TabBarContextValue = {
  value: string
  select: (value: string) => void
  measure: (value: string, layout: LayoutRectangle) => void
}

const TabBarContext = React.createContext<TabBarContextValue | null>(null)

function useTabBar() {
  const context = React.useContext(TabBarContext)

  if (!context) {
    throw new Error('TabBar parts must be rendered inside a <TabBar>.')
  }

  return context
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

type TabBarProps = Omit<ViewProps, 'children'> & {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  /** Strength of the blur behind the bar, 0-100. */
  intensity?: number
  tint?: React.ComponentProps<typeof BlurView>['tint']
}

/**
 * A floating tab bar whose selection is a single pill that slides between
 * tabs. Holding and dragging along the bar hands the pill to the finger — it
 * tracks the touch directly, stretches while travelling and settles onto
 * whichever tab it is released over, so the selection reads as one piece of
 * liquid rather than a highlight blinking from tab to tab.
 */
function TabBar({
  className,
  value,
  onValueChange,
  children,
  intensity = 60,
  tint = 'default',
  ...props
}: TabBarProps) {
  const [layouts, setLayouts] = React.useState<Record<string, LayoutRectangle>>({})

  // The pan handlers are created once, so everything a drag reads has to come
  // from a ref rather than from that first render's values.
  const layoutsRef = React.useRef(layouts)
  const valueRef = React.useRef(value)
  const originRef = React.useRef(0)
  const rowWidthRef = React.useRef(0)
  const pillWidthRef = React.useRef(0)
  const draggingRef = React.useRef(false)
  const hoverRef = React.useRef<string | null>(null)
  const rowRef = React.useRef<View>(null)

  layoutsRef.current = layouts
  valueRef.current = value

  const x = React.useRef(new Animated.Value(0)).current
  const width = React.useRef(new Animated.Value(0)).current
  const stretch = React.useRef(new Animated.Value(1)).current
  // The pill has nowhere to sit until the tabs have been measured.
  const [ready, setReady] = React.useState(false)

  // Following the finger means positioning the pill by its centre, which needs
  // whatever width it currently has rather than the width it is heading for.
  React.useEffect(() => {
    const id = width.addListener(({ value: current }) => {
      pillWidthRef.current = current
    })

    return () => width.removeListener(id)
  }, [width])

  const measure = React.useCallback((tab: string, layout: LayoutRectangle) => {
    setLayouts((current) => {
      const previous = current[tab]

      if (previous?.x === layout.x && previous?.width === layout.width) {
        return current
      }

      return { ...current, [tab]: layout }
    })
  }, [])

  const settle = React.useCallback(
    (tab: string) => {
      const layout = layoutsRef.current[tab]

      if (!layout) return

      Animated.parallel([
        Animated.spring(x, { ...SPRING, toValue: layout.x }),
        Animated.spring(width, { ...SPRING, toValue: layout.width }),
      ]).start()
    },
    [width, x]
  )

  const active = layouts[value]

  React.useEffect(() => {
    if (!active) return

    // A drag positions the pill itself; springing at the same time fights it.
    if (draggingRef.current) return

    if (!ready) {
      // Appear in place the first time, rather than sliding in from the edge.
      x.setValue(active.x)
      width.setValue(active.width)
      pillWidthRef.current = active.width
      setReady(true)

      return
    }

    Animated.parallel([
      Animated.spring(x, { ...SPRING, toValue: active.x }),
      Animated.spring(width, { ...SPRING, toValue: active.width }),
    ]).start()
  }, [active, ready, width, x])

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        // A tap belongs to the tab under it; only a sideways drag is a slide.
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > SLIDE_THRESHOLD && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          draggingRef.current = true
          hoverRef.current = valueRef.current
          x.stopAnimation()
          Animated.spring(stretch, { ...SPRING, toValue: STRETCH }).start()
        },
        onPanResponderMove: (_event, gesture) => {
          const local = gesture.moveX - originRef.current
          const hit = Object.entries(layoutsRef.current).find(
            ([, layout]) => local >= layout.x && local <= layout.x + layout.width
          )

          if (hit && hit[0] !== hoverRef.current) {
            hoverRef.current = hit[0]
            // Only the width is animated during a drag, and only when the tab
            // under the finger changes — restarting it every frame stutters.
            Animated.spring(width, { ...SPRING, toValue: hit[1].width }).start()
            onValueChange(hit[0])
          }

          // Tracking the touch directly is what makes the drag feel attached.
          const pill = pillWidthRef.current

          x.setValue(clamp(local - pill / 2, 0, Math.max(rowWidthRef.current - pill, 0)))
        },
        onPanResponderRelease: () => {
          draggingRef.current = false
          Animated.spring(stretch, { ...SPRING, toValue: 1 }).start()
          settle(hoverRef.current ?? valueRef.current)
        },
        onPanResponderTerminate: () => {
          draggingRef.current = false
          Animated.spring(stretch, { ...SPRING, toValue: 1 }).start()
          settle(hoverRef.current ?? valueRef.current)
        },
      }),
    [onValueChange, settle, stretch, width, x]
  )

  const context = React.useMemo<TabBarContextValue>(
    () => ({ value, select: onValueChange, measure }),
    [measure, onValueChange, value]
  )

  return (
    <TabBarContext.Provider value={context}>
      <GlassView
        intensity={intensity}
        tint={tint}
        className={cn(
          'w-full overflow-hidden rounded-full border border-border/60 bg-card/70 shadow-lg',
          className
        )}
        {...props}
      >
        <View className="flex-row items-center p-1">
          <View
            ref={rowRef}
            className="w-full flex-row items-center"
            // A drag reports screen coordinates, while tabs are measured from
            // this row, so the row keeps track of where it sits on screen.
            onLayout={(event) => {
              rowWidthRef.current = event.nativeEvent.layout.width
              rowRef.current?.measureInWindow((pageX) => {
                originRef.current = pageX
              })
            }}
            {...panResponder.panHandlers}
          >
            <View className="absolute bottom-0 left-0 right-0 top-0" pointerEvents="none">
              <AnimatedView
                style={{
                  width,
                  opacity: ready ? 1 : 0,
                  transform: [{ translateX: x }, { scaleX: stretch }],
                }}
                className="h-full rounded-full border border-border/50 bg-foreground/10"
              />
            </View>
            {children}
          </View>
        </View>
      </GlassView>
    </TabBarContext.Provider>
  )
}

type TabBarItemProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
  value: string
  label?: string
  /** Handed the selected state, so the caller can colour its own icon. */
  icon?: (state: { selected: boolean }) => React.ReactNode
  badge?: React.ReactNode
}

/**
 * `flex-1` gives every tab the same share of the bar, so the pill keeps one
 * width wherever it lands rather than resizing to each label. `h-12` plus the
 * bar's own padding is a 56pt bar — the height a compact iOS tab bar sits at,
 * and tight enough that the labels stay close to their icons.
 */
function TabBarItem({ className, value, label, icon, badge, ...props }: TabBarItemProps) {
  const { value: current, select, measure } = useTabBar()
  const selected = current === value

  return (
    <Pressable
      role="tab"
      aria-selected={selected}
      onPress={() => select(value)}
      onLayout={(event) => measure(value, event.nativeEvent.layout)}
      className={cn('h-12 flex-1 items-center justify-center gap-1 px-0.5', className)}
      {...props}
    >
      <TextClassContext.Provider
        // 10pt is the size iOS sets tab labels at, and the size that keeps a
        // word like "Categories" intact once five tabs share a phone's width.
        value={cn(
          'text-[10px] font-medium leading-none',
          selected ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {icon ? (
          <View>
            {icon({ selected })}
            {badge}
          </View>
        ) : null}
        {label ? <Text numberOfLines={1}>{label}</Text> : null}
      </TextClassContext.Provider>
    </Pressable>
  )
}

/** A count or dot pinned to the top-right of a tab icon. */
function TabBarBadge({ className, children, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        'absolute -right-2.5 -top-1.5 h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1',
        className
      )}
      {...props}
    >
      <TextClassContext.Provider value="text-[10px] font-bold leading-none text-destructive-foreground">
        {children}
      </TextClassContext.Provider>
    </View>
  )
}

export { TabBar, TabBarBadge, TabBarItem, useTabBar }
export type { TabBarItemProps, TabBarProps }
