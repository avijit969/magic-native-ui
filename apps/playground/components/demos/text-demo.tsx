import { View } from 'react-native'

import { Text } from '@/registry/ui/text'

export function TextDemo() {
  return (
    <View className="w-full gap-2">
      <Text className="text-2xl font-bold">Heading</Text>
      <Text>Body copy inherits colour from its parent.</Text>
      <Text className="text-muted-foreground">Muted supporting text.</Text>
    </View>
  )
}
