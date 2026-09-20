import * as React from 'react'
import { View } from 'react-native'

import { Button } from '@/registry/ui/button'
import { Progress } from '@/registry/ui/progress'
import { Text } from '@/registry/ui/text'

export function ProgressDemo() {
  const [value, setValue] = React.useState(35)

  return (
    <View className="w-full gap-4">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">Uploading</Text>
          <Text className="text-sm text-muted-foreground">{value}%</Text>
        </View>
        <Progress value={value} />
      </View>

      <View className="flex-row gap-2">
        <Button size="sm" variant="outline" onPress={() => setValue(Math.max(0, value - 20))}>
          <Text>Less</Text>
        </Button>
        <Button size="sm" variant="outline" onPress={() => setValue(Math.min(100, value + 20))}>
          <Text>More</Text>
        </Button>
      </View>
    </View>
  )
}
