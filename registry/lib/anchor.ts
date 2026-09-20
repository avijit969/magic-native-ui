import type * as React from 'react'
import type { View } from 'react-native'

/**
 * Positioning for overlays that hang off a trigger — popovers, dropdown menus,
 * context menus, selects.
 *
 * React Native has no portal and no popper, so an anchored overlay is built by
 * hand: measure the trigger in window coordinates, render the content inside a
 * `Modal`, and place it with an absolute offset. The maths lives here rather
 * than in each component so the four of them cannot drift apart on the parts
 * that are easy to get subtly wrong — flipping near an edge and clamping.
 */

export type AnchorRect = {
  x: number
  y: number
  width: number
  height: number
}

export type Size = {
  width: number
  height: number
}

export type Side = 'top' | 'right' | 'bottom' | 'left'

export type Align = 'start' | 'center' | 'end'

export type Position = {
  top: number
  left: number
  /** The side actually used, which differs from the request when it was flipped. */
  side: Side
}

export type PositionOptions = {
  anchor: AnchorRect
  content: Size
  window: Size
  /** Preferred side of the anchor. Flipped when there is not enough room. */
  side?: Side
  /** Alignment along the anchor's other axis. */
  align?: Align
  /** Gap between the anchor and the content. */
  offset?: number
  /** Smallest distance to keep from the window edges. */
  margin?: number
}

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

/**
 * Keeps `value` within the range, preferring `min` when the range is inverted —
 * which happens when the content is larger than the window, where pinning to the
 * top-left at least leaves the start of it readable.
 */
function clamp(value: number, min: number, max: number): number {
  if (max < min) return min

  return Math.min(Math.max(value, min), max)
}

/** Room between the anchor and the window edge on one side, excluding the margin. */
function roomOn(side: Side, anchor: AnchorRect, window: Size, margin: number): number {
  switch (side) {
    case 'top':
      return anchor.y - margin
    case 'bottom':
      return window.height - (anchor.y + anchor.height) - margin
    case 'left':
      return anchor.x - margin
    case 'right':
      return window.width - (anchor.x + anchor.width) - margin
  }
}

/** Where the content starts on the axis it is aligned along. */
function alignStart(align: Align, anchorStart: number, anchorSize: number, contentSize: number) {
  switch (align) {
    case 'start':
      return anchorStart
    case 'center':
      return anchorStart + anchorSize / 2 - contentSize / 2
    case 'end':
      return anchorStart + anchorSize - contentSize
  }
}

/**
 * Places `content` beside `anchor`, flipping to the opposite side when the
 * preferred one cannot fit and the opposite has more room, then clamping so the
 * result never leaves the window.
 *
 * Flipping compares available room rather than flipping on any overflow: near
 * the middle of a short screen neither side fits, and flipping there would make
 * the overlay jump around for no gain.
 */
export function positionContent({
  anchor,
  content,
  window,
  side = 'bottom',
  align = 'start',
  offset = 4,
  margin = 8,
}: PositionOptions): Position {
  const vertical = side === 'top' || side === 'bottom'
  const needed = (vertical ? content.height : content.width) + offset

  const opposite = OPPOSITE[side]
  const room = roomOn(side, anchor, window, margin)
  const resolved =
    room < needed && roomOn(opposite, anchor, window, margin) > room ? opposite : side

  let top: number
  let left: number

  switch (resolved) {
    case 'bottom':
      top = anchor.y + anchor.height + offset
      left = alignStart(align, anchor.x, anchor.width, content.width)
      break
    case 'top':
      top = anchor.y - content.height - offset
      left = alignStart(align, anchor.x, anchor.width, content.width)
      break
    case 'right':
      top = alignStart(align, anchor.y, anchor.height, content.height)
      left = anchor.x + anchor.width + offset
      break
    case 'left':
      top = alignStart(align, anchor.y, anchor.height, content.height)
      left = anchor.x - content.width - offset
      break
  }

  return {
    top: clamp(top, margin, window.height - content.height - margin),
    left: clamp(left, margin, window.width - content.width - margin),
    side: resolved,
  }
}

/**
 * Measures a trigger in window coordinates, which is the space a `Modal` draws
 * in. `measureInWindow` is callback-based and returns nothing for an unmounted
 * node, so this resolves `null` rather than leaving the caller waiting.
 */
export function measureAnchor(ref: React.RefObject<View | null>): Promise<AnchorRect | null> {
  return new Promise((resolve) => {
    const node = ref.current

    if (!node) {
      resolve(null)

      return
    }

    node.measureInWindow((x, y, width, height) => {
      // A node that is laid out but not yet drawn reports zeroes on Android.
      if (width === 0 && height === 0) {
        resolve(null)

        return
      }

      resolve({ x, y, width, height })
    })
  })
}

/** A zero-size rect at a point, for menus opened at a touch rather than a trigger. */
export function rectFromPoint(x: number, y: number): AnchorRect {
  return { x, y, width: 0, height: 0 }
}
