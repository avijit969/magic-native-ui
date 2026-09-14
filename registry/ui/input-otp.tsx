import * as React from 'react'
import { Pressable, TextInput, View } from 'react-native'

import { Text } from '@/registry/ui/text'
import { cn } from '@/registry/lib/utils'

type InputOTPProps = Omit<
  React.ComponentProps<typeof TextInput>,
  'value' | 'onChangeText' | 'maxLength'
> & {
  value?: string
  defaultValue?: string
  onChangeText?: (value: string) => void
  /** Called once the last slot is filled. */
  onComplete?: (value: string) => void
  length?: number
  invalid?: boolean
  /** Renders dots instead of digits, for PINs. */
  masked?: boolean
  className?: string
}

/**
 * The slots are plain views — a real `TextInput` sits transparently on top of
 * them, which keeps one cursor, one autofill target and one keyboard for the
 * whole code. Splitting it into one field per digit breaks all three.
 */
function InputOTP({
  className,
  value: valueProp,
  defaultValue = '',
  onChangeText,
  onComplete,
  length = 6,
  invalid,
  masked,
  editable,
  readOnly,
  onFocus,
  onBlur,
  ...props
}: InputOTPProps) {
  const inputRef = React.useRef<TextInput>(null)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [focused, setFocused] = React.useState(false)

  const value = valueProp ?? uncontrolled
  const off = editable === false || readOnly === true

  function handleChangeText(next: string) {
    const digits = next.replace(/\D/g, '').slice(0, length)

    if (digits === value) return

    setUncontrolled(digits)
    onChangeText?.(digits)

    if (digits.length === length) {
      onComplete?.(digits)
    }
  }

  return (
    <Pressable
      className={cn('w-full flex-row gap-2', off && 'opacity-50', className)}
      disabled={off}
      onPress={() => inputRef.current?.focus()}
    >
      {Array.from({ length }, (_, index) => {
        const char = value[index]
        // With every slot filled there is no next one, so the last stays lit.
        const active = focused && index === Math.min(value.length, length - 1)

        return (
          <View
            key={index}
            className={cn(
              'h-12 flex-1 items-center justify-center rounded-md border border-input bg-background',
              active && 'border-2 border-ring',
              invalid && 'border-destructive'
            )}
          >
            <Text className="text-xl font-semibold">
              {char ? (masked ? '\u2022' : char) : ''}
            </Text>
          </View>
        )
      })}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        maxLength={length}
        editable={editable}
        readOnly={readOnly}
        caretHidden
        keyboardType="number-pad"
        inputMode="numeric"
        // Lets iOS and Android offer the SMS code straight from the keyboard.
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        aria-invalid={invalid}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        className="absolute left-0 top-0 h-full w-full text-transparent opacity-0"
        {...props}
      />
    </Pressable>
  )
}

export { InputOTP }
export type { InputOTPProps }
