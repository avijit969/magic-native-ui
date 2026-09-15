import { View } from 'react-native'

import { cn } from '@/registry/lib/utils'

type SeparatorProps = React.ComponentProps<typeof View> & {
  orientation?: 'horizontal' | 'vertical'
  /** A purely visual rule, hidden from assistive technology. */
  decorative?: boolean
}

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <View
      role={decorative ? 'presentation' : 'separator'}
      aria-hidden={decorative}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
}

export { Separator }
export type { SeparatorProps }
