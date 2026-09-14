import * as React from 'react'
import { View } from 'react-native'

import { InputOTP } from '@/registry/ui/input-otp'
import { Label } from '@/registry/ui/label'
import { Text } from '@/registry/ui/text'

export function InputOTPDemo() {
  const [code, setCode] = React.useState('')

  return (
    <View className="w-full gap-5">
      <View className="gap-1.5">
        <Label>Verification code</Label>
        <InputOTP value={code} onChangeText={setCode} />
        <Text className="text-xs text-muted-foreground">
          {code.length === 6 ? 'Ready to verify.' : 'Enter the 6-digit code we sent you.'}
        </Text>
      </View>

      <View className="gap-1.5">
        <Label>PIN</Label>
        <InputOTP masked length={4} defaultValue="12" />
      </View>
    </View>
  )
}
