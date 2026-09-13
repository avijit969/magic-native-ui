import { TextInput } from 'react-native'

import { cn } from '@/registry/lib/utils'

function Input({ className, ...props }: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      className={cn(
        'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground',
        'focus:border-ring',
        'disabled:opacity-50',
        className
      )}
      // Colour props are resolved from `accent-*` utilities, not `text-*`.
      placeholderTextColorClassName="accent-muted-foreground"
      {...props}
    />
  )
}

export { Input }
