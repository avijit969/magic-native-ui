import * as React from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'

/**
 * Uniwind resolves `className` into a `style` **array**. The web builds of
 * `@rn-primitives/*` hand their props to a Radix `asChild` slot, which merges
 * styles with an object spread — and spreading an array produces
 * `{ 0: { ... } }`. Every class is dropped, and the next render throws
 * (`Failed to set an indexed property [0] on 'CSSStyleDeclaration'`) as React
 * tries to apply that object to the DOM node, blanking the tree.
 *
 * Flattening to a single object before the primitive keeps the spread
 * lossless. On native the array is flattened downstream regardless, so this
 * only ever changes behaviour on web.
 *
 *   const LabelText = withUniwind(withFlatStyle(LabelPrimitive.Text))
 */
export function withFlatStyle<P extends { style?: unknown }>(Component: React.ComponentType<P>) {
  function FlatStyle({ style, ...props }: P) {
    const flat = StyleSheet.flatten(style as StyleProp<ViewStyle>)

    return <Component {...({ ...props, style: flat } as P)} />
  }

  const name = Component.displayName ?? Component.name

  FlatStyle.displayName = name ? `WithFlatStyle(${name})` : 'WithFlatStyle'

  return FlatStyle
}
