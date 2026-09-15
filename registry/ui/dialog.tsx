import * as React from 'react'
import { X } from 'lucide-react-native'
import { Modal, Pressable, View, type GestureResponderEvent, type ViewProps } from 'react-native'

import { iconWithClassName } from '@/registry/lib/icons'
import { Text } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

const XIcon = iconWithClassName(X)

type PressableProps = React.ComponentProps<typeof Pressable>

type DialogContextValue = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext(name: string) {
  const context = React.useContext(DialogContext)

  if (!context) {
    throw new Error(`<${name} /> must be rendered inside a <Dialog />`)
  }

  return context
}

/**
 * React Native has no Radix slot, so `asChild` clones the single child instead
 * of rendering a Pressable of its own — `<DialogTrigger asChild><Button /></DialogTrigger>`.
 * The child's own props win, and its `onPress` runs before the dialog's.
 */
function PressableSlot({ asChild, children, ...props }: PressableProps & { asChild?: boolean }) {
  if (!asChild) {
    return <Pressable {...props}>{children}</Pressable>
  }

  const child = React.Children.only(children) as React.ReactElement<PressableProps>

  return React.cloneElement(child, {
    ...props,
    ...child.props,
    onPress: (event: GestureResponderEvent) => {
      child.props.onPress?.(event)
      props.onPress?.(event)
    },
  })
}

type DialogProps = ViewProps & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Dialog({ open: openProp, defaultOpen = false, onOpenChange, ...props }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
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

  const value = React.useMemo(
    () => ({ open, onOpenChange: handleOpenChange }),
    [open, handleOpenChange]
  )

  return (
    <DialogContext.Provider value={value}>
      <View {...props} />
    </DialogContext.Provider>
  )
}

type DialogTriggerProps = PressableProps & { asChild?: boolean }

function DialogTrigger({ asChild, disabled, onPress, ...props }: DialogTriggerProps) {
  const { open, onOpenChange } = useDialogContext('DialogTrigger')

  function handlePress(event: GestureResponderEvent) {
    onOpenChange(true)
    onPress?.(event)
  }

  return (
    <PressableSlot
      asChild={asChild}
      role="button"
      aria-expanded={open}
      aria-disabled={disabled ?? undefined}
      disabled={disabled}
      onPress={handlePress}
      {...props}
    />
  )
}

type DialogOverlayProps = PressableProps & {
  /** Pressing the overlay closes the dialog. */
  closeOnPress?: boolean
}

function DialogOverlay({ className, closeOnPress = true, onPress, ...props }: DialogOverlayProps) {
  const { onOpenChange } = useDialogContext('DialogOverlay')

  function handlePress(event: GestureResponderEvent) {
    if (closeOnPress) {
      onOpenChange(false)
    }

    onPress?.(event)
  }

  return (
    <Pressable
      accessible={false}
      onPress={handlePress}
      className={cn('absolute inset-0 z-50 items-center justify-center bg-black/80 p-4', className)}
      {...props}
    />
  )
}

type DialogContentProps = ViewProps

/**
 * React Native's own `Modal` does the job a portal does on the web: it lifts the
 * dialog above the rest of the tree, closes on the Android back button and on
 * Escape, and needs no host component at the root of the app.
 */
function DialogContent({ className, children, ...props }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext('DialogContent')

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => onOpenChange(false)}
    >
      <DialogOverlay>
        <View
          role="dialog"
          aria-modal={true}
          // Without this a press on the content reaches the overlay, which closes.
          onStartShouldSetResponder={() => true}
          className={cn(
            'z-50 w-full max-w-lg gap-4 rounded-lg border border-border bg-background p-6 shadow-lg',
            className
          )}
          {...props}
        >
          {children}
          <DialogClose className="absolute right-4 top-4 rounded-sm p-1 active:opacity-70">
            <XIcon size={18} className="text-muted-foreground" />
          </DialogClose>
        </View>
      </DialogOverlay>
    </Modal>
  )
}

function DialogHeader({ className, ...props }: ViewProps) {
  return <View className={cn('gap-1.5', className)} {...props} />
}

function DialogFooter({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row justify-end gap-2', className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      role="heading"
      className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn('text-sm text-muted-foreground', className)} {...props} />
}

type DialogCloseProps = PressableProps & { asChild?: boolean }

function DialogClose({ asChild, onPress, ...props }: DialogCloseProps) {
  const { onOpenChange } = useDialogContext('DialogClose')

  function handlePress(event: GestureResponderEvent) {
    onOpenChange(false)
    onPress?.(event)
  }

  return <PressableSlot asChild={asChild} role="button" onPress={handlePress} {...props} />
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
}
export type { DialogContentProps, DialogProps }
