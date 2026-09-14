import { View } from 'react-native'

import { Label } from '@/registry/ui/label'
import { Text } from '@/registry/ui/text'
import { Textarea } from '@/registry/ui/textarea'

export function TextareaDemo() {
  return (
    <View className="w-full gap-5">
      <View className="gap-1.5">
        <Label nativeID="bio">Bio</Label>
        <Textarea placeholder="Tell us about yourself" aria-labelledby="bio" />
      </View>

      <Textarea variant="filled" size="sm" placeholder="Filled, two lines high" />

      <View className="gap-1.5">
        <Textarea invalid defaultValue="Too short." size="sm" />
        <Text className="text-xs text-destructive">Use at least 40 characters.</Text>
      </View>
    </View>
  )
}
