import { View } from 'react-native'
import { Heart } from 'lucide-react-native'

import { TactileButton } from '@/registry/ui/tactile-button'

export function TactileButtonDemo() {
  return (
    <View className="w-full gap-3">
      <View className="flex-row flex-wrap items-end gap-3">
        <TactileButton size="sm">Small</TactileButton>
        <TactileButton>Medium</TactileButton>
        <TactileButton size="lg">Large</TactileButton>
      </View>

      <View className="flex-row flex-wrap items-center gap-3">
        <TactileButton color="#e11d48">Rose</TactileButton>
        <TactileButton color="#15803d">Green</TactileButton>
        <TactileButton color="#eab308">Gold</TactileButton>
        <TactileButton color="#ffffff">White</TactileButton>
      </View>

      <TactileButton
        fullWidth
        color="#0f172a"
        icon={({ size, color }) => <Heart size={size} color={color} />}
      >
        Like
      </TactileButton>

      <View className="flex-row flex-wrap items-center gap-3">
        <TactileButton loading>Saving</TactileButton>
        <TactileButton disabled>Disabled</TactileButton>
      </View>
    </View>
  )
}
