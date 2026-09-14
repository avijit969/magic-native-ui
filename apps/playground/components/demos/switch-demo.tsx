import * as React from 'react'
import { View } from 'react-native'

import { Switch } from '@/registry/ui/switch'
import { Text } from '@/registry/ui/text'

export function SwitchDemo() {
  const [checked, setChecked] = React.useState(true)

  return (
    <View className="flex-row items-center gap-3">
      <Switch checked={checked} onCheckedChange={setChecked} />
      <Text>Notifications</Text>
    </View>
  )
}
