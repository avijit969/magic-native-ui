import * as DialogPrimitive from '@rn-primitives/dialog'
import { X } from 'lucide-react-native'
import { View, type ViewProps } from 'react-native'
import { withUniwind } from 'uniwind'

import { iconWithClassName } from '@/registry/lib/icons'
import { withFlatStyle } from '@/registry/lib/primitive'
import { Text, TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

const DialogOverlayPrimitive = withUniwind(withFlatStyle(DialogPrimitive.Overlay))
const DialogContentPrimitive = withUniwind(withFlatStyle(DialogPrimitive.Content))
const DialogTriggerPrimitive = withUniwind(withFlatStyle(DialogPrimitive.Trigger))
const DialogClosePrimitive = withUniwind(withFlatStyle(DialogPrimitive.Close))
const DialogTitlePrimitive = withUniwind(withFlatStyle(DialogPrimitive.Title))
const DialogDescriptionPrimitive = withUniwind(withFlatStyle(DialogPrimitive.Description))

const XIcon = iconWithClassName(X)

const Dialog = DialogPrimitive.Root
const DialogPortal = DialogPrimitive.Portal

// Uniwind reads `className` as a style, so forwarding one the caller never
// passed hands it `undefined` — spread the props through untouched instead.
function DialogTrigger(props: React.ComponentProps<typeof DialogTriggerPrimitive>) {
  return <DialogTriggerPrimitive {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogOverlayPrimitive>) {
  return (
    <DialogOverlayPrimitive
      className={cn('absolute inset-0 z-50 items-center justify-center bg-black/80 p-4', className)}
      {...props}
    />
  )
}

type DialogContentProps = React.ComponentProps<typeof DialogContentPrimitive> & {
  /** Renders into a named `<PortalHost />` instead of the default one. */
  portalHost?: string
}

function DialogContent({ className, children, portalHost, ...props }: DialogContentProps) {
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <DialogContentPrimitive
          className={cn(
            'z-50 w-full max-w-lg gap-4 rounded-lg border border-border bg-background p-6 shadow-lg',
            className
          )}
          {...props}
        >
          {children}
          <DialogClosePrimitive className="absolute right-4 top-4 rounded-sm p-1 active:opacity-70">
            <XIcon size={18} className="text-muted-foreground" />
          </DialogClosePrimitive>
        </DialogContentPrimitive>
      </DialogOverlay>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: ViewProps) {
  return <View className={cn('gap-1.5', className)} {...props} />
}

function DialogFooter({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row justify-end gap-2', className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogTitlePrimitive>) {
  return (
    <DialogTitlePrimitive
      className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescriptionPrimitive>) {
  return (
    <DialogDescriptionPrimitive
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function DialogClose(props: React.ComponentProps<typeof DialogClosePrimitive>) {
  return <DialogClosePrimitive {...props} />
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
export type { DialogContentProps }
