import { View } from 'react-native'

import { Input } from '@/registry/ui/input'
import { Label } from '@/registry/ui/label'
import { Text } from '@/registry/ui/text'

export function InputDemo() {
  return (
    <View className="w-full gap-5">
      <View className="gap-1.5">
        <Label nativeID="email">Email</Label>
        <Input
          placeholder="you@example.com"
          aria-labelledby="email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="gap-2">
        <Input variant="filled" placeholder="Filled" />
        <Input variant="underline" placeholder="Underline" />
        <Input variant="ghost" placeholder="Ghost" />
      </View>

      <View className="gap-2">
        <Input size="sm" placeholder="Small" />
        <Input size="lg" placeholder="Large" />
      </View>

      <View className="gap-1.5">
        <Input invalid defaultValue="not-an-email" />
        <Text className="text-xs text-destructive">Enter a valid email address.</Text>
      </View>

      <Input editable={false} placeholder="Disabled" />
    </View>
  )
}
