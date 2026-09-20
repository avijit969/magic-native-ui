import * as React from 'react'
import {
  Modal,
  Pressable,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type ViewProps,
} from 'react-native'

import {
  measureAnchor,
  positionContent,
  type Align,
  type AnchorRect,
  type Side,
  type Size,
} from '@/registry/lib/anchor'
import { cn } from '@/registry/lib/utils'

type PressableProps = React.ComponentProps<typeof Pressable>

type PopoverContextValue = {
  open: boolean
  anchor: AnchorRect | null
  triggerRef: React.RefObject<View | null>
  onOpenChange: (open: boolean) => void
  openFromTrigger: () => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext(name: string) {
  const context = React.useContext(PopoverContext)

  if (!context) {
    throw new Error(`<${name} /> must be rendered inside a <Popover />`)
  }

  return context
}

/** Assigns one node to several refs, so a cloned child keeps the ref it came with. */
function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as React.RefObject<T | null>).current = node
      }
    }
  }
}

type PopoverProps = ViewProps & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Popover({ open: openProp, defaultOpen = false, onOpenChange, ...props }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const [anchor, setAnchor] = React.useState<AnchorRect | null>(null)
  const triggerRef = React.useRef<View | null>(null)
  const open = openProp ?? uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) {
        setUncontrolledOpen(next)
      }

      onOpenChange?.(next)
    },
    [openProp, onOpenChange]
  )

  /**
   * Measuring before opening rather than on mount keeps the position right when
   * the trigger has moved — inside a list that scrolled, for instance.
   */
  const openFromTrigger = React.useCallback(async () => {
    setAnchor(await measureAnchor(triggerRef))
    handleOpenChange(true)
  }, [handleOpenChange])

  const value = React.useMemo(
    () => ({ open, anchor, triggerRef, onOpenChange: handleOpenChange, openFromTrigger }),
    [open, anchor, handleOpenChange, openFromTrigger]
  )

  return (
    <PopoverContext.Provider value={value}>
      <View {...props} />
    </PopoverContext.Provider>
  )
}

type PopoverTriggerProps = PressableProps & {
  asChild?: boolean
  ref?: React.Ref<View>
}

function PopoverTrigger({ asChild, disabled, onPress, ref, ...props }: PopoverTriggerProps) {
  const { open, openFromTrigger, triggerRef } = usePopoverContext('PopoverTrigger')

  function handlePress(event: GestureResponderEvent) {
    void openFromTrigger()
    onPress?.(event)
  }

  const triggerProps = {
    role: 'button' as const,
    'aria-expanded': open,
    'aria-disabled': disabled ?? undefined,
    disabled,
    onPress: handlePress,
    ...props,
  }

  if (!asChild) {
    return <Pressable ref={mergeRefs(triggerRef, ref)} {...triggerProps} />
  }

  const child = React.Children.only(props.children) as React.ReactElement<
    PressableProps & { ref?: React.Ref<View> }
  >

  const { children: _children, ...rest } = triggerProps

  return React.cloneElement(child, {
    ...rest,
    ...child.props,
    // The measured node has to be the element the user actually sees.
    ref: mergeRefs(triggerRef, ref, child.props.ref),
    onPress: (event: GestureResponderEvent) => {
      child.props.onPress?.(event)
      handlePress(event)
    },
  })
}

type PopoverContentProps = ViewProps & {
  side?: Side
  align?: Align
  sideOffset?: number
  /** Pressing outside the content closes the popover. */
  closeOnPressOutside?: boolean
}

/**
 * React Native has no portal, so the content is lifted out of the tree with a
 * `Modal` — which also gives the Android back button and Escape for free — and
 * placed by hand against the measured trigger.
 *
 * Placement takes two passes: the content is laid out invisibly to learn its
 * size, then positioned. Without that the first frame would be drawn at the top
 * left corner and visibly jump.
 */
function PopoverContent({
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  closeOnPressOutside = true,
  ...props
}: PopoverContentProps) {
  const { open, anchor, onOpenChange } = usePopoverContext('PopoverContent')
  const window = useWindowDimensions()
  const [size, setSize] = React.useState<Size | null>(null)

  // Children can change between openings, so the measurement cannot be reused.
  React.useEffect(() => {
    if (!open) setSize(null)
  }, [open])

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout

    setSize((previous) =>
      previous && previous.width === width && previous.height === height
        ? previous
        : { width, height }
    )
  }

  // Measuring can fail — an unmounted trigger, or a node Android has laid out
  // but not yet drawn. Falling back to the middle of the screen keeps the
  // content reachable, where waiting for an anchor would leave it invisible.
  const resolvedAnchor = anchor ?? {
    x: window.width / 2,
    y: window.height / 2,
    width: 0,
    height: 0,
  }

  const position = size
    ? positionContent({
        anchor: resolvedAnchor,
        content: size,
        window: { width: window.width, height: window.height },
        side,
        align,
        offset: sideOffset,
      })
    : null

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => onOpenChange(false)}
    >
      <View className="flex-1">
        <Pressable
          accessible={false}
          onPress={() => closeOnPressOutside && onOpenChange(false)}
          className="absolute inset-0"
        />
        <View
          role="dialog"
          onLayout={handleLayout}
          // Absolute placement is measured in pixels, which no class can carry.
          // Until it is known the content is laid out but kept invisible.
          style={
            position
              ? { position: 'absolute', top: position.top, left: position.left }
              : { position: 'absolute', opacity: 0 }
          }
          className={cn(
            'z-50 w-72 rounded-md border border-border bg-popover p-4 shadow-md',
            className
          )}
          {...props}
        />
      </View>
    </Modal>
  )
}

type PopoverCloseProps = PressableProps & { asChild?: boolean }

function PopoverClose({ asChild, onPress, children, ...props }: PopoverCloseProps) {
  const { onOpenChange } = usePopoverContext('PopoverClose')

  function handlePress(event: GestureResponderEvent) {
    onOpenChange(false)
    onPress?.(event)
  }

  if (!asChild) {
    return (
      <Pressable role="button" onPress={handlePress} {...props}>
        {children}
      </Pressable>
    )
  }

  const child = React.Children.only(children) as React.ReactElement<PressableProps>

  return React.cloneElement(child, {
    ...props,
    ...child.props,
    onPress: (event: GestureResponderEvent) => {
      child.props.onPress?.(event)
      handlePress(event)
    },
  })
}

export { Popover, PopoverClose, PopoverContent, PopoverTrigger }
export type { PopoverContentProps, PopoverProps, PopoverTriggerProps }
