/**
 * The shape Hugeicons publishes its icon data in: the children of the `<svg>`
 * element, each one a `[tag, attributes]` pair using React attribute names.
 *
 * Keeping the data as plain arrays rather than components is what lets a single
 * icon be vendored into a project without pulling in the 6.18 MB upstream
 * barrel — see `magic-native-ui icon add`.
 */
export type IconSvgElement = readonly (readonly [string, Record<string, string | number>])[]
