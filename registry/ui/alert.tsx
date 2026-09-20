import * as React from 'react'
import { View, type ViewProps } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'

import { Text, TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

const alertVariants = cva('w-full flex-row items-start gap-3 rounded-lg border p-4', {
  variants: {
    variant: {
      default: 'border-border bg-background',
      destructive: 'border-destructive/50 bg-background',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

/**
 * The variant's colour reaches the title and description through context, since
 * React Native has no inheritance to carry it down. An icon passed as the first
 * child takes its colour from its own `className`, the way icons always do.
 */
const alertTextVariants = cva('text-sm', {
  variants: {
    variant: {
      default: 'text-foreground',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type AlertProps = ViewProps & VariantProps<typeof alertVariants>

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <TextClassContext.Provider value={alertTextVariants({ variant })}>
      <View role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
    </TextClassContext.Provider>
  )
}

/**
 * The text column. It is a separate part rather than something `Alert` wraps
 * around its children, because an icon has to sit beside the column rather than
 * inside it — and only the caller knows whether there is one.
 */
function AlertContent({ className, ...props }: ViewProps) {
  return <View className={cn('flex-1 gap-1', className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      role="heading"
      className={cn('text-base font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn('text-sm opacity-90', className)} {...props} />
}

export { Alert, AlertContent, AlertDescription, AlertTitle, alertTextVariants, alertVariants }
export type { AlertProps }
