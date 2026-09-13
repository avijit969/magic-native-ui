import * as React from 'react'
import { View, type ViewProps } from 'react-native'

import { Text, TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

function Card({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className={cn('rounded-lg border border-border bg-card shadow-sm', className)}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn('gap-1.5 p-6', className)} {...props} />
}

function CardTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      role="heading"
      aria-level={3}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn('text-sm text-muted-foreground', className)} {...props} />
}

function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn('p-6 pt-0', className)} {...props} />
}

function CardFooter({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row items-center p-6 pt-0', className)} {...props} />
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
