import * as React from 'react'
import { ActivityIndicator, Animated, Pressable, View, type PressableProps } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { withUniwind } from 'uniwind'

import { Text, TextClassContext } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

const AnimatedView = withUniwind(Animated.View)

/** Face colour used when the caller passes none. Any colour string is accepted. */
const DEFAULT_COLOR = '#4f46e5'

/** How far the side of the button is darkened below the face colour. */
const SHADOW_DARKEN = 0.28

const tactileButtonVariants = cva('flex-row items-center justify-center gap-2', {
  variants: {
    size: {
      sm: 'min-h-9 px-3.5 py-2',
      md: 'min-h-11 px-5 py-3',
      lg: 'min-h-14 px-6 py-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const tactileButtonTextVariants = cva('font-bold tracking-wide', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

type Size = 'sm' | 'md' | 'lg'

const DEPTH: Record<Size, number> = { sm: 3, md: 4, lg: 5 }
const ICON_SIZE: Record<Size, number> = { sm: 14, md: 16, lg: 18 }

/**
 * Reads `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()`. Anything else —
 * a named colour, `hsl()`, `oklch()` — returns null and the caller falls back.
 */
function toRgb(color: string): [number, number, number] | null {
  const value = color.trim()

  const hex = /^#([0-9a-f]+)$/i.exec(value)
  if (hex) {
    const digits = hex[1]!

    if (digits.length === 3 || digits.length === 4) {
      return [
        parseInt(digits[0]! + digits[0]!, 16),
        parseInt(digits[1]! + digits[1]!, 16),
        parseInt(digits[2]! + digits[2]!, 16),
      ]
    }

    if (digits.length === 6 || digits.length === 8) {
      return [
        parseInt(digits.slice(0, 2), 16),
        parseInt(digits.slice(2, 4), 16),
        parseInt(digits.slice(4, 6), 16),
      ]
    }

    return null
  }

  const rgb = /^rgba?\(([^)]+)\)$/i.exec(value)
  if (rgb) {
    const parts = rgb[1]!.split(/[\s,/]+/).filter(Boolean).map(Number)

    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null

    return [parts[0]!, parts[1]!, parts[2]!]
  }

  return null
}

/**
 * Picks a label colour that stays readable on `color`, using perceived
 * brightness (ITU-R BT.601). Unreadable colours default to white, which is the
 * safe answer for the saturated colours this button is usually given.
 */
function readableTextColor(color: string) {
  const rgb = toRgb(color)
  if (!rgb) return '#ffffff'

  const [r, g, b] = rgb

  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#18181b' : '#ffffff'
}

type TactileButtonProps = Omit<PressableProps, 'children' | 'style'> &
  VariantProps<typeof tactileButtonVariants> & {
    children?: React.ReactNode
    /** Face colour. Accepts any React Native colour string. */
    color?: string
    /** Side colour. Derived from `color` when omitted. */
    shadowColor?: string
    /** Label and spinner colour. Derived from `color` when omitted. */
    textColor?: string
    /** How far the face sits above the side, in pixels. Defaults per size. */
    depth?: number
    borderRadius?: number
    loading?: boolean
    /** An element, or a function handed the resolved icon size and colour. */
    icon?: React.ReactNode | ((state: { size: number; color: string }) => React.ReactNode)
    iconPosition?: 'left' | 'right'
    fullWidth?: boolean
    /** Classes for the animated face, which owns padding and height. */
    contentClassName?: string
    textClassName?: string
  }

/**
 * A button with physical depth: a coloured side sits behind the face, and
 * pressing drops the face onto it.
 *
 * Colours are props rather than theme classes, because the side has to be
 * derived from the face at runtime — it is the face colour composited with
 * black, which is why every colour format works and not just the ones this
 * file can parse.
 */
function TactileButton({
  children,
  className,
  contentClassName,
  textClassName,
  color = DEFAULT_COLOR,
  shadowColor,
  textColor,
  size = 'md',
  depth: depthProp,
  borderRadius = 8,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onPressIn,
  onPressOut,
  ...props
}: TactileButtonProps) {
  const resolvedSize: Size = size ?? 'md'
  const depth = depthProp ?? DEPTH[resolvedSize]
  const labelColor = textColor ?? readableTextColor(color)
  const press = React.useRef(new Animated.Value(0)).current

  const handlePressIn: PressableProps['onPressIn'] = (event) => {
    Animated.timing(press, { toValue: depth, duration: 60, useNativeDriver: true }).start()
    onPressIn?.(event)
  }

  const handlePressOut: PressableProps['onPressOut'] = (event) => {
    Animated.timing(press, { toValue: 0, duration: 100, useNativeDriver: true }).start()
    onPressOut?.(event)
  }

  const iconNode =
    typeof icon === 'function' ? icon({ size: ICON_SIZE[resolvedSize], color: labelColor }) : icon

  /**
   * A string label is coloured by the button; element children are rendered as
   * given, and read their size from `TextClassContext` like every other
   * component here.
   */
  const label =
    typeof children === 'string' || typeof children === 'number' ? (
      <Text style={{ color: labelColor }}>{children}</Text>
    ) : (
      children
    )

  return (
    <View
      className={cn(
        'relative self-start',
        fullWidth && 'w-full self-stretch',
        disabled && 'opacity-50',
        className
      )}
      style={{ paddingBottom: depth }}
    >
      {/* The side, a full-size copy of the face offset down by `depth`. */}
      <View
        className="absolute inset-x-0 bottom-0"
        style={{ top: depth, backgroundColor: shadowColor ?? color, borderRadius }}
      >
        {shadowColor ? null : (
          <View
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0, 0, 0, ${SHADOW_DARKEN})`, borderRadius }}
          />
        )}
      </View>

      <Pressable
        role="button"
        disabled={disabled || loading}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={cn('self-start', fullWidth && 'self-stretch')}
        {...props}
      >
        <AnimatedView
          className={cn(tactileButtonVariants({ size: resolvedSize }), contentClassName)}
          style={{ backgroundColor: color, borderRadius, transform: [{ translateY: press }] }}
        >
          <TextClassContext.Provider
            value={cn(tactileButtonTextVariants({ size: resolvedSize }), textClassName)}
          >
            {loading ? (
              <ActivityIndicator size="small" color={labelColor} />
            ) : (
              <>
                {iconPosition === 'left' ? iconNode : null}
                {label}
                {iconPosition === 'right' ? iconNode : null}
              </>
            )}
          </TextClassContext.Provider>
        </AnimatedView>
      </Pressable>
    </View>
  )
}

export { TactileButton, tactileButtonTextVariants, tactileButtonVariants }
export type { TactileButtonProps }
