import type { LucideIcon } from 'lucide-react-native'
import { withUniwind } from 'uniwind'

/**
 * Lucide icons are configured through a `color` prop rather than a class name.
 * Mapping `className` onto the resolved `color` style keeps icon usage the same
 * as on the web — `<Check className="text-primary-foreground" size={16} />`.
 */
export function iconWithClassName(icon: LucideIcon) {
  return withUniwind(icon, {
    color: {
      fromClassName: 'className',
      styleProperty: 'color',
    },
  })
}
