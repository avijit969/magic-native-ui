import * as CheckboxPrimitive from '@rn-primitives/checkbox'
import { Check } from 'lucide-react-native'
import { withUniwind } from 'uniwind'

import { iconWithClassName } from '@/registry/lib/icons'
import { withFlatStyle } from '@/registry/lib/primitive'
import { cn } from '@/registry/lib/utils'

const CheckboxRoot = withUniwind(withFlatStyle(CheckboxPrimitive.Root))
const CheckboxIndicator = withUniwind(withFlatStyle(CheckboxPrimitive.Indicator))
const CheckIcon = iconWithClassName(Check)

type CheckboxProps = React.ComponentProps<typeof CheckboxRoot>

function Checkbox({ className, checked, ...props }: CheckboxProps) {
  return (
    <CheckboxRoot
      checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      className={cn(
        'h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary',
        'data-[state=checked]:bg-primary',
        'disabled:opacity-50',
        className
      )}
      {...props}
    >
      <CheckboxIndicator className="h-full w-full items-center justify-center">
        <CheckIcon size={12} className="text-primary-foreground" />
      </CheckboxIndicator>
    </CheckboxRoot>
  )
}

export { Checkbox }
export type { CheckboxProps }
