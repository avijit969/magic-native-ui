import * as React from 'react'
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg'
import { withUniwind } from 'uniwind'

import type { IconSvgElement } from '@/registry/lib/hugeicons/types'

/**
 * Hugeicons draws with `stroke="currentColor"`, and react-native-svg resolves
 * `currentColor` from the `color` prop on the root `<Svg>`. Mapping `className`
 * onto that prop is what makes `<Icon icon={HeartIcon} className="text-primary" />`
 * behave the way a colour utility does on the web.
 */
const StyledSvg = withUniwind(Svg, {
  color: {
    fromClassName: 'className',
    styleProperty: 'color',
  },
})

/** The only element types the free icon set draws with. */
const ELEMENTS = {
  path: Path,
  circle: Circle,
  ellipse: Ellipse,
  rect: Rect,
} as const

type IconProps = Omit<React.ComponentProps<typeof StyledSvg>, 'children'> & {
  icon: IconSvgElement
  /** Sets both width and height; every icon is drawn on a 24x24 viewBox. */
  size?: number
  /** Overrides the stroke width baked into the icon data. */
  strokeWidth?: number
}

function Icon({ icon, size = 24, strokeWidth, ...props }: IconProps) {
  return (
    <StyledSvg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {icon.map(([tag, attributes], index) => {
        const Element = ELEMENTS[tag as keyof typeof ELEMENTS]

        // Unknown tags are skipped rather than taking down the whole screen.
        if (!Element) return null

        const { key, ...rest } = attributes

        return (
          <Element
            key={typeof key === 'string' || typeof key === 'number' ? key : index}
            {...(rest as Record<string, never>)}
            // Only restroke shapes that were already stroked, so filled parts stay filled.
            {...(strokeWidth !== undefined && rest.strokeWidth !== undefined ? { strokeWidth } : {})}
          />
        )
      })}
    </StyledSvg>
  )
}

export { Icon }
export type { IconProps }
