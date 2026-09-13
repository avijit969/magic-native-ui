import * as SwitchPrimitive from '@rn-primitives/switch'
import { withUniwind } from 'uniwind'

import { cn } from '@/registry/lib/utils'

const SwitchRoot = withUniwind(SwitchPrimitive.Root)
const SwitchThumb = withUniwind(SwitchPrimitive.Thumb)

type SwitchProps = React.ComponentProps<typeof SwitchRoot>

/**
 * `group-*` variants are a Uniwind Pro feature, so the thumb reads the checked
 * state from its own `data-state` prop rather than from the root.
 */
function Switch({ className, checked, ...props }: SwitchProps) {
  const state = checked ? 'checked' : 'unchecked'

  return (
    <SwitchRoot
      checked={checked}
      data-state={state}
      className={cn(
        'h-6 w-11 shrink-0 flex-row items-center rounded-full border-2 border-transparent px-0.5',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        'disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchThumb
        data-state={state}
        className={cn(
          'h-5 w-5 rounded-full bg-background shadow',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchRoot>
  )
}

export { Switch }
export type { SwitchProps }
