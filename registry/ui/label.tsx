import * as LabelPrimitive from '@rn-primitives/label'
import { withUniwind } from 'uniwind'

import { cn } from '@/registry/lib/utils'

const LabelRoot = withUniwind(LabelPrimitive.Root)
const LabelText = withUniwind(LabelPrimitive.Text)

type LabelProps = React.ComponentProps<typeof LabelText> & {
  onPress?: React.ComponentProps<typeof LabelRoot>['onPress']
}

function Label({ className, onPress, ...props }: LabelProps) {
  return (
    <LabelRoot onPress={onPress}>
      <LabelText
        className={cn('text-sm font-medium leading-none text-foreground', className)}
        {...props}
      />
    </LabelRoot>
  )
}

export { Label }
export type { LabelProps }
