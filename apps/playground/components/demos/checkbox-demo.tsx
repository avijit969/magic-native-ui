import * as React from 'react'
import { View } from 'react-native'

import { Checkbox } from '@/registry/ui/checkbox'
import { Text } from '@/registry/ui/text'

export function CheckboxDemo() {
  const [checked, setChecked] = React.useState(true)

  return (
    <View className="flex-row items-center gap-3">
      <Checkbox checked={checked} onCheckedChange={setChecked} />
      <Text>Accept terms and conditions</Text>
    </View>
  )
}
