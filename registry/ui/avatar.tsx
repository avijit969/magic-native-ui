import * as React from 'react'
import { Image, View, type ImageProps, type ViewProps } from 'react-native'

import { TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

type AvatarStatus = 'loading' | 'loaded' | 'error'

type AvatarContextValue = {
  alt: string
  status: AvatarStatus
  setStatus: (status: AvatarStatus) => void
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null)

function useAvatarContext(name: string) {
  const context = React.useContext(AvatarContext)

  if (!context) {
    throw new Error(`<${name} /> must be rendered inside an <Avatar />`)
  }

  return context
}

type AvatarProps = ViewProps & {
  /** Announced in place of the image, and used as the fallback's label. */
  alt: string
}

function Avatar({ alt, className, ...props }: AvatarProps) {
  const [status, setStatus] = React.useState<AvatarStatus>('loading')
  const value = React.useMemo(() => ({ alt, status, setStatus }), [alt, status])

  return (
    <AvatarContext.Provider value={value}>
      <View
        className={cn('relative h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
        {...props}
      />
    </AvatarContext.Provider>
  )
}

function AvatarImage({ className, onLoad, onError, ...props }: Omit<ImageProps, 'alt'>) {
  const { alt, status, setStatus } = useAvatarContext('AvatarImage')

  if (status === 'error') {
    return null
  }

  return (
    <Image
      alt={alt}
      onLoad={(event) => {
        setStatus('loaded')
        onLoad?.(event)
      }}
      onError={(event) => {
        setStatus('error')
        onError?.(event)
      }}
      className={cn('h-full w-full', className)}
      {...props}
    />
  )
}

/**
 * Sits over the image rather than beside it, so it covers the empty frame while
 * the image is still loading and disappears the moment it arrives.
 */
function AvatarFallback({ className, ...props }: ViewProps) {
  const { alt, status } = useAvatarContext('AvatarFallback')

  if (status === 'loaded') {
    return null
  }

  return (
    <TextClassContext.Provider value="text-sm font-medium text-muted-foreground">
      <View
        role="img"
        aria-label={alt}
        className={cn(
          'absolute inset-0 items-center justify-center rounded-full bg-muted',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

export { Avatar, AvatarFallback, AvatarImage }
export type { AvatarProps }
