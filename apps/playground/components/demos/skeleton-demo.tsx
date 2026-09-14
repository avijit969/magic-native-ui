import { View } from 'react-native'

import { Skeleton } from '@/registry/ui/skeleton'

export function SkeletonDemo() {
  return (
    <View className="w-full flex-row items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </View>
    </View>
  )
}
