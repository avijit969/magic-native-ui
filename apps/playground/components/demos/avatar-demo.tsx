import { View } from 'react-native'

import { Avatar, AvatarFallback, AvatarImage } from '@/registry/ui/avatar'
import { Text } from '@/registry/ui/text'

export function AvatarDemo() {
  return (
    <View className="flex-row items-center gap-3">
      <Avatar alt="Shadcn avatar">
        <AvatarImage source={{ uri: 'https://github.com/shadcn.png' }} />
        <AvatarFallback>
          <Text>CN</Text>
        </AvatarFallback>
      </Avatar>
      <Avatar alt="Fallback only">
        <AvatarFallback>
          <Text>MN</Text>
        </AvatarFallback>
      </Avatar>
    </View>
  )
}
