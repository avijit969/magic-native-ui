import { View } from 'react-native'

import { Button } from '@/registry/ui/button'
import { Input } from '@/registry/ui/input'
import { Label } from '@/registry/ui/label'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/registry/ui/popover'
import { Text } from '@/registry/ui/text'

export function PopoverDemo() {
  return (
    <View className="w-full items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Text>Set width</Text>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <View className="gap-3">
            <View className="gap-1">
              <Text className="text-sm font-medium">Dimensions</Text>
              <Text className="text-xs text-muted-foreground">
                Set the size of the layer.
              </Text>
            </View>
            <View className="gap-1.5">
              <Label nativeID="width">Width</Label>
              <Input aria-labelledby="width" defaultValue="100%" />
            </View>
            <PopoverClose asChild>
              <Button size="sm">
                <Text>Save</Text>
              </Button>
            </PopoverClose>
          </View>
        </PopoverContent>
      </Popover>
    </View>
  )
}
