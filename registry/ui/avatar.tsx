import * as AvatarPrimitive from '@rn-primitives/avatar'
import { withUniwind } from 'uniwind'

import { TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

const AvatarRoot = withUniwind(AvatarPrimitive.Root)
const AvatarImagePrimitive = withUniwind(AvatarPrimitive.Image)
const AvatarFallbackPrimitive = withUniwind(AvatarPrimitive.Fallback)

type AvatarProps = React.ComponentProps<typeof AvatarRoot>

function Avatar({ className, ...props }: AvatarProps) {
  return (
    <AvatarRoot
      className={cn('relative h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarImagePrimitive>) {
  return <AvatarImagePrimitive className={cn('h-full w-full', className)} {...props} />
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarFallbackPrimitive>) {
  return (
    <TextClassContext.Provider value="text-sm font-medium text-muted-foreground">
      <AvatarFallbackPrimitive
        className={cn('h-full w-full items-center justify-center rounded-full bg-muted', className)}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

export { Avatar, AvatarFallback, AvatarImage }
export type { AvatarProps }
