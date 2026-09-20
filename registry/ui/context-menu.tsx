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
  positionContent,
  rectFromPoint,
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

type ContextMenuContextValue = {
  open: boolean
  anchor: AnchorRect | null
  onOpenChange: (open: boolean) => void
  openAt: (x: number, y: number) => void
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null)

function useContextMenuContext(name: string) {
  const context = React.useContext(ContextMenuContext)

  if (!context) {
    throw new Error(`<${name} /> must be rendered inside a <ContextMenu />`)
  }

  return context
}

type ContextMenuProps = ViewProps & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function ContextMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: ContextMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const [anchor, setAnchor] = React.useState<AnchorRect | null>(null)
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

  /** A context menu opens where the finger is, not where the element is. */
  const openAt = React.useCallback(
    (x: number, y: number) => {
      setAnchor(rectFromPoint(x, y))
      handleOpenChange(true)
    },
    [handleOpenChange]
  )

  const value = React.useMemo(
    () => ({ open, anchor, onOpenChange: handleOpenChange, openAt }),
    [open, anchor, handleOpenChange, openAt]
  )

  return (
    <ContextMenuContext.Provider value={value}>
      <View {...props} />
    </ContextMenuContext.Provider>
  )
}

type ContextMenuTriggerProps = PressableProps & { asChild?: boolean }

/**
 * Long press rather than right click: React Native has no notion of a secondary
 * button, and that includes react-native-web, where `Pressable` reports touches
 * and clicks through the same handlers. Long press is the gesture users already
 * expect for this on a phone, and it is the one gesture available on all three
 * platforms.
 */
function ContextMenuTrigger({
  asChild,
  disabled,
  onLongPress,
  children,
  ...props
}: ContextMenuTriggerProps) {
  const { open, openAt } = useContextMenuContext('ContextMenuTrigger')

  function handleLongPress(event: GestureResponderEvent) {
    const { pageX, pageY } = event.nativeEvent

    openAt(pageX, pageY)
    onLongPress?.(event)
  }

  const triggerProps = {
    // React Native maps only a subset of aria-*; `aria-haspopup` is not in it,
    // so `aria-expanded` is what actually reaches a screen reader here.
    'aria-expanded': open,
    'aria-disabled': disabled ?? undefined,
    disabled,
    onLongPress: handleLongPress,
    ...props,
  }

  if (!asChild) {
    return <Pressable {...triggerProps}>{children}</Pressable>
  }

  const child = React.Children.only(children) as React.ReactElement<PressableProps>

  return React.cloneElement(child, {
    ...triggerProps,
    ...child.props,
    onLongPress: (event: GestureResponderEvent) => {
      child.props.onLongPress?.(event)
      handleLongPress(event)
    },
  })
}

type ContextMenuContentProps = ViewProps & {
  side?: Side
  align?: Align
  sideOffset?: number
}

function ContextMenuContent({
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  ...props
}: ContextMenuContentProps) {
  const { open, anchor, onOpenChange } = useContextMenuContext('ContextMenuContent')
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

  // A controlled `open` can be set without a touch ever having been recorded,
  // so the menu falls back to the middle of the screen rather than staying
  // invisible while it waits for an anchor it will never get.
  const resolvedAnchor = anchor ?? rectFromPoint(window.width / 2, window.height / 2)

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

type ContextMenuItemProps = PressableProps & {
  inset?: boolean
  variant?: 'default' | 'destructive'
  closeOnPress?: boolean
}

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  closeOnPress = true,
  disabled,
  onPress,
  ...props
}: ContextMenuItemProps) {
  const { onOpenChange } = useContextMenuContext('ContextMenuItem')

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

type ContextMenuCheckboxItemProps = Omit<ContextMenuItemProps, 'inset' | 'children'> & {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Narrower than Pressable's children: the indicator rules out a render prop. */
  children?: React.ReactNode
}

function ContextMenuCheckboxItem({
  checked,
  onCheckedChange,
  closeOnPress = false,
  children,
  onPress,
  ...props
}: ContextMenuCheckboxItemProps) {
  function handlePress(event: GestureResponderEvent) {
    onCheckedChange?.(!checked)
    onPress?.(event)
  }

  return (
    <ContextMenuItem
      aria-checked={checked}
      closeOnPress={closeOnPress}
      onPress={handlePress}
      {...props}
    >
      <View className="w-4 items-center justify-center">
        {checked ? <CheckIcon size={14} className="text-foreground" /> : null}
      </View>
      {children}
    </ContextMenuItem>
  )
}

function ContextMenuLabel({
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

function ContextMenuSeparator({ className, ...props }: ViewProps) {
  return <View role="presentation" className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
}

function ContextMenuGroup({ className, ...props }: ViewProps) {
  return <View role="group" className={cn('gap-0.5', className)} {...props} />
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
}
export type { ContextMenuContentProps, ContextMenuItemProps, ContextMenuProps }
