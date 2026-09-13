import * as SeparatorPrimitive from '@rn-primitives/separator'
import { withUniwind } from 'uniwind'

import { cn } from '@/registry/lib/utils'

const SeparatorRoot = withUniwind(SeparatorPrimitive.Root)

type SeparatorProps = React.ComponentProps<typeof SeparatorRoot>

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorRoot
      orientation={orientation}
      decorative={decorative}
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
