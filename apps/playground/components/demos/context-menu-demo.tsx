import * as React from 'react'
import { View } from 'react-native'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/registry/ui/context-menu'
import { Text } from '@/registry/ui/text'

export function ContextMenuDemo() {
  const [starred, setStarred] = React.useState(false)

  return (
    <View className="w-full">
      <ContextMenu>
        <ContextMenuTrigger>
          <View className="h-32 items-center justify-center rounded-md border border-dashed border-border">
            <Text className="text-sm text-muted-foreground">Long press here</Text>
          </View>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuLabel>Document</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Text>Open</Text>
          </ContextMenuItem>
          <ContextMenuItem>
            <Text>Duplicate</Text>
          </ContextMenuItem>
          <ContextMenuCheckboxItem checked={starred} onCheckedChange={setStarred}>
            <Text>Starred</Text>
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">
            <Text>Delete</Text>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </View>
  )
}
