import { View } from 'react-native'

import { Input } from '@/registry/ui/input'
import { Label } from '@/registry/ui/label'

export function LabelDemo() {
  return (
    <View className="w-full gap-1.5">
      <Label nativeID="username">Username</Label>
      <Input placeholder="shadcn" aria-labelledby="username" autoCapitalize="none" />
    </View>
  )
}
