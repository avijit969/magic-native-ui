import { View } from 'react-native'

import { Separator } from '@/registry/ui/separator'
import { Text } from '@/registry/ui/text'

export function SeparatorDemo() {
  return (
    <View className="w-full gap-3">
      <Text>Above</Text>
      <Separator />
      <Text>Below</Text>
    </View>
  )
}
