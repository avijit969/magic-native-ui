import * as React from 'react'
import { View } from 'react-native'
import {
  CircleUserRound,
  House,
  LayoutGrid,
  PlayCircle,
  ShoppingCart,
} from 'lucide-react-native'

import { TabBar, TabBarBadge, TabBarItem } from '@/registry/ui/tab-bar'
import { Text } from '@/registry/ui/text'
import { iconWithClassName } from '@/registry/lib/icons'

const HouseIcon = iconWithClassName(House)
const PlayIcon = iconWithClassName(PlayCircle)
const GridIcon = iconWithClassName(LayoutGrid)
const AccountIcon = iconWithClassName(CircleUserRound)
const CartIcon = iconWithClassName(ShoppingCart)

type Tab = { value: string; label: string; Icon: typeof HouseIcon; badge?: string }

const TABS: Tab[] = [
  { value: 'home', label: 'Home', Icon: HouseIcon },
  { value: 'play', label: 'Play', Icon: PlayIcon },
  { value: 'categories', label: 'Categories', Icon: GridIcon },
  { value: 'account', label: 'Account', Icon: AccountIcon },
  { value: 'cart', label: 'Cart', Icon: CartIcon, badge: '1' },
]

export function TabBarDemo() {
  const [tab, setTab] = React.useState<string>('home')

  return (
    <View className="w-full items-center gap-3">
      <TabBar value={tab} onValueChange={setTab}>
        {TABS.map(({ value, label, Icon, badge }) => (
          <TabBarItem
            key={value}
            value={value}
            label={label}
            icon={({ selected }) => (
              <Icon
                size={20}
                className={selected ? 'text-primary' : 'text-muted-foreground'}
              />
            )}
            badge={
              badge ? (
                <TabBarBadge>
                  <Text>{badge}</Text>
                </TabBarBadge>
              ) : undefined
            }
          />
        ))}
      </TabBar>
      <Text className="text-xs text-muted-foreground">
        Tap a tab, or hold and slide across the bar.
      </Text>
    </View>
  )
}
