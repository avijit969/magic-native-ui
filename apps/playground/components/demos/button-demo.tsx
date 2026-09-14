import { View } from 'react-native'

import { Button } from '@/registry/ui/button'
import { Text } from '@/registry/ui/text'

export function ButtonDemo() {
  return (
    <View className="w-full gap-3">
      <Button>
        <Text>Default</Text>
      </Button>
      <Button variant="secondary">
        <Text>Secondary</Text>
      </Button>
      <Button variant="destructive">
        <Text>Destructive</Text>
      </Button>
      <Button variant="outline">
        <Text>Outline</Text>
      </Button>
      <Button variant="ghost">
        <Text>Ghost</Text>
      </Button>
      <Button variant="link">
        <Text>Link</Text>
      </Button>

      <View className="flex-row items-center gap-2">
        <Button size="sm">
          <Text>Small</Text>
        </Button>
        <Button size="lg">
          <Text>Large</Text>
        </Button>
      </View>

      <Button disabled>
        <Text>Disabled</Text>
      </Button>
    </View>
  )
}
