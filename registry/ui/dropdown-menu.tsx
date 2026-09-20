import * as React from 'react'
import { Check } from 'lucide-react-native'
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
import { iconWithClassName } from '@/registry/lib/icons'
import { Text, TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

const CheckIcon = iconWithClassName(Check)

type PressableProps = React.ComponentProps<typeof Pressable>

type DropdownMenuContextValue = {
  open: boolean
  anchor: AnchorRect | null
  triggerRef: React.RefObject<View | null>
  onOpenChange: (open: boolean) => void
  openFromTrigger: () => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext(name: string) {
  const context = React.useContext(DropdownMenuContext)

  if (!context) {
    throw new Error(`<${name} /> must be rendered inside a <DropdownMenu />`)
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

type DropdownMenuProps = ViewProps & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function DropdownMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: DropdownMenuProps) {
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

  /** Measured on open rather than on mount, so a scrolled trigger still lines up. */
  const openFromTrigger = React.useCallback(async () => {
    setAnchor(await measureAnchor(triggerRef))
    handleOpenChange(true)
  }, [handleOpenChange])

  const value = React.useMemo(
    () => ({ open, anchor, triggerRef, onOpenChange: handleOpenChange, openFromTrigger }),
    [open, anchor, handleOpenChange, openFromTrigger]
  )

  return (
    <DropdownMenuContext.Provider value={value}>
      <View {...props} />
    </DropdownMenuContext.Provider>
  )
}

type DropdownMenuTriggerProps = PressableProps & {
  asChild?: boolean
  ref?: React.Ref<View>
}

function DropdownMenuTrigger({
  asChild,
  disabled,
  onPress,
  ref,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, openFromTrigger, triggerRef } = useDropdownMenuContext('DropdownMenuTrigger')

  function handlePress(event: GestureResponderEvent) {
    void openFromTrigger()
    onPress?.(event)
  }

  const triggerProps = {
    role: 'button' as const,
    // React Native maps only a subset of aria-*; `aria-haspopup` is not in it,
    // so `aria-expanded` is what actually reaches a screen reader here.
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

type DropdownMenuContentProps = ViewProps & {
  side?: Side
  align?: Align
  sideOffset?: number
}

/**
 * A `Modal` stands in for the portal a menu needs on the web: it lifts the menu
 * above everything else and closes on the Android back button.
 *
 * Placement takes two passes — the menu is laid out invisibly to learn its size,
 * then positioned against the measured trigger. Without that it would be drawn
 * at the top left corner for a frame and visibly jump.
 */
function DropdownMenuContent({
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) {
  const { open, anchor, onOpenChange } = useDropdownMenuContext('DropdownMenuContent')
  const window = useWindowDimensions()
  const [size, setSize] = React.useState<Size | null>(null)

  // Items can change between openings, so the measurement cannot be reused.
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
  // but not yet drawn. Falling back to the middle of the screen keeps the menu
  // reachable, where waiting for an anchor would leave it invisible.
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
          onPress={() => onOpenChange(false)}
          className="absolute inset-0"
        />
        <View
          role="menu"
          onLayout={handleLayout}
          // Absolute placement is measured in pixels, which no class can carry.
          // Until it is known the menu is laid out but kept invisible.
          style={
            position
              ? { position: 'absolute', top: position.top, left: position.left }
              : { position: 'absolute', opacity: 0 }
          }
          className={cn(
            'z-50 min-w-32 overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md',
            className
          )}
          {...props}
        />
      </View>
    </Modal>
  )
}

type DropdownMenuItemProps = PressableProps & {
  /** Leaves room for the indicator column that checkbox items occupy. */
  inset?: boolean
  variant?: 'default' | 'destructive'
  /** Selecting an item closes the menu, as it does on the web. */
  closeOnPress?: boolean
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  closeOnPress = true,
  disabled,
  onPress,
  ...props
}: DropdownMenuItemProps) {
  const { onOpenChange } = useDropdownMenuContext('DropdownMenuItem')

  function handlePress(event: GestureResponderEvent) {
    onPress?.(event)

    if (closeOnPress) {
      onOpenChange(false)
    }
  }

  return (
    <TextClassContext.Provider
      value={variant === 'destructive' ? 'text-sm text-destructive' : 'text-sm text-foreground'}
    >
      <Pressable
        role="menuitem"
        aria-disabled={disabled ?? undefined}
        disabled={disabled}
        onPress={handlePress}
        className={cn(
          'flex-row items-center gap-2 rounded-sm px-2 py-1.5',
          'active:bg-accent disabled:opacity-50',
          inset && 'pl-8',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

type DropdownMenuCheckboxItemProps = Omit<DropdownMenuItemProps, 'inset' | 'children'> & {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Narrower than Pressable's children: the indicator rules out a render prop. */
  children?: React.ReactNode
}

/**
 * The indicator sits in a fixed-width column rather than being conditionally
 * rendered, so labels stay aligned whether or not an item is checked.
 */
function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  closeOnPress = false,
  children,
  onPress,
  ...props
}: DropdownMenuCheckboxItemProps) {
  function handlePress(event: GestureResponderEvent) {
    onCheckedChange?.(!checked)
    onPress?.(event)
  }

  return (
    <DropdownMenuItem
      role="menuitem"
      aria-checked={checked}
      closeOnPress={closeOnPress}
      onPress={handlePress}
      {...props}
    >
      <View className="w-4 items-center justify-center">
        {checked ? <CheckIcon size={14} className="text-foreground" /> : null}
      </View>
      {children}
    </DropdownMenuItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof Text> & { inset?: boolean }) {
  return (
    <Text
      className={cn(
        'px-2 py-1.5 text-sm font-semibold text-foreground',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: ViewProps) {
  return <View role="presentation" className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
}

function DropdownMenuGroup({ className, ...props }: ViewProps) {
  return <View role="group" className={cn('gap-0.5', className)} {...props} />
}

/** The keyboard hint shadcn shows on the web. Useful on tablets with a keyboard. */
function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
}
export type { DropdownMenuContentProps, DropdownMenuItemProps, DropdownMenuProps }
