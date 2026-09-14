import { View } from 'react-native'

import { Badge } from '@/registry/ui/badge'
import { Text } from '@/registry/ui/text'

export function BadgeDemo() {
  return (
    <View className="flex-row flex-wrap gap-2">
      <Badge>
        <Text>Default</Text>
      </Badge>
      <Badge variant="secondary">
        <Text>Secondary</Text>
      </Badge>
      <Badge variant="destructive">
        <Text>Destructive</Text>
      </Badge>
      <Badge variant="outline">
        <Text>Outline</Text>
      </Badge>
    </View>
  )
}
