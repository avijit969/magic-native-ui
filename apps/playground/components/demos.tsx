import * as React from 'react'
import { Pressable, View } from 'react-native'
import {
  AtSign,
  CircleUserRound,
  Eye,
  EyeOff,
  Heart,
  House,
  LayoutGrid,
  PlayCircle,
  Search,
  ShoppingCart,
} from 'lucide-react-native'

import { Avatar, AvatarFallback, AvatarImage } from '@/registry/ui/avatar'
import { Badge } from '@/registry/ui/badge'
import { Button } from '@/registry/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/ui/card'
import { Checkbox } from '@/registry/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/ui/dialog'
import { Input } from '@/registry/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/ui/input-group'
import { InputOTP } from '@/registry/ui/input-otp'
import { Label } from '@/registry/ui/label'
import { Separator } from '@/registry/ui/separator'
import { Skeleton } from '@/registry/ui/skeleton'
import { Switch } from '@/registry/ui/switch'
import { TabBar, TabBarBadge, TabBarItem } from '@/registry/ui/tab-bar'
import { TactileButton } from '@/registry/ui/tactile-button'
import { Textarea } from '@/registry/ui/textarea'
import { Text } from '@/registry/ui/text'
import { iconWithClassName } from '@/registry/lib/icons'

const AtSignIcon = iconWithClassName(AtSign)
const EyeIcon = iconWithClassName(Eye)
const EyeOffIcon = iconWithClassName(EyeOff)
const SearchIcon = iconWithClassName(Search)
const HouseIcon = iconWithClassName(House)
const PlayIcon = iconWithClassName(PlayCircle)
const GridIcon = iconWithClassName(LayoutGrid)
const AccountIcon = iconWithClassName(CircleUserRound)
const CartIcon = iconWithClassName(ShoppingCart)

function ButtonDemo() {
  return (
    <View className="gap-3">
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
    </View>
  )
}

function TextDemo() {
  return (
    <View className="gap-2">
      <Text className="text-2xl font-bold">Heading</Text>
      <Text>Body copy inherits colour from its parent.</Text>
      <Text className="text-muted-foreground">Muted supporting text.</Text>
    </View>
  )
}

function BadgeDemo() {
  return (
    <View className="flex-row flex-wrap gap-2">
      <Badge>
        <Text>Default</Text>
      </Badge>
      <Badge variant="secondary">
        <Text>Secondary</Text>
      </Badge>
      <Badge variant="destructive">
        <Text>Destructive</Text>
      </Badge>
      <Badge variant="outline">
        <Text>Outline</Text>
      </Badge>
    </View>
  )
}

function CardDemo() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Project settings</CardTitle>
        <CardDescription>Manage how this project behaves.</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>Card content sits here.</Text>
      </CardContent>
    </Card>
  )
}

function InputDemo() {
  return (
    <View className="w-full gap-5">
      <View className="gap-1.5">
        <Label nativeID="email">Email</Label>
        <Input
          placeholder="you@example.com"
          aria-labelledby="email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="gap-2">
        <Input variant="filled" placeholder="Filled" />
        <Input variant="underline" placeholder="Underline" />
        <Input variant="ghost" placeholder="Ghost" />
      </View>

      <View className="gap-2">
        <Input size="sm" placeholder="Small" />
        <Input size="lg" placeholder="Large" />
      </View>

      <View className="gap-1.5">
        <Input invalid defaultValue="not-an-email" />
        <Text className="text-xs text-destructive">Enter a valid email address.</Text>
      </View>

      <Input editable={false} placeholder="Disabled" />
    </View>
  )
}

function TextareaDemo() {
  return (
    <View className="w-full gap-5">
      <View className="gap-1.5">
        <Label nativeID="bio">Bio</Label>
        <Textarea placeholder="Tell us about yourself" aria-labelledby="bio" />
      </View>
      <Textarea variant="filled" size="sm" placeholder="Filled, two lines high" />
      <View className="gap-1.5">
        <Textarea invalid defaultValue="Too short." size="sm" />
        <Text className="text-xs text-destructive">Use at least 40 characters.</Text>
      </View>
    </View>
  )
}

function InputGroupDemo() {
  const [visible, setVisible] = React.useState(false)

  return (
    <View className="w-full gap-5">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon size={16} className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search components" />
      </InputGroup>

      <InputGroup>
        <InputGroupInput
          placeholder="Password"
          secureTextEntry={!visible}
          autoCapitalize="none"
        />
        <InputGroupAddon>
          <Pressable
            onPress={() => setVisible(!visible)}
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <EyeOffIcon size={16} className="text-muted-foreground" />
            ) : (
              <EyeIcon size={16} className="text-muted-foreground" />
            )}
          </Pressable>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup variant="filled">
        <InputGroupAddon>
          <Text>$</Text>
        </InputGroupAddon>
        <InputGroupInput placeholder="0.00" keyboardType="decimal-pad" />
        <InputGroupAddon>
          <Text>USD</Text>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup variant="underline">
        <InputGroupAddon>
          <AtSignIcon size={16} className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput placeholder="username" autoCapitalize="none" />
      </InputGroup>
    </View>
  )
}

function InputOTPDemo() {
  const [code, setCode] = React.useState('')

  return (
    <View className="w-full gap-5">
      <View className="gap-1.5">
        <Label>Verification code</Label>
        <InputOTP value={code} onChangeText={setCode} />
        <Text className="text-xs text-muted-foreground">
          {code.length === 6 ? 'Ready to verify.' : 'Enter the 6-digit code we sent you.'}
        </Text>
      </View>

      <View className="gap-1.5">
        <Label>PIN</Label>
        <InputOTP masked length={4} defaultValue="12" />
      </View>
    </View>
  )
}

function LabelDemo() {
  return <Label>Accept the terms</Label>
}

function SeparatorDemo() {
  return (
    <View className="w-full gap-3">
      <Text>Above</Text>
      <Separator />
      <Text>Below</Text>
    </View>
  )
}

function SkeletonDemo() {
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

function AvatarDemo() {
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

function SwitchDemo() {
  const [checked, setChecked] = React.useState(true)

  return (
    <View className="flex-row items-center gap-3">
      <Switch checked={checked} onCheckedChange={setChecked} />
      <Text>Notifications</Text>
    </View>
  )
}

function CheckboxDemo() {
  const [checked, setChecked] = React.useState(true)

  return (
    <View className="flex-row items-center gap-3">
      <Checkbox checked={checked} onCheckedChange={setChecked} />
      <Text>Accept terms and conditions</Text>
    </View>
  )
}

function DialogDemo() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Text>Open dialog</Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            This permanently removes the project and everything in it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onPress={() => setOpen(false)}>
            <Text>Cancel</Text>
          </Button>
          <Button variant="destructive" onPress={() => setOpen(false)}>
            <Text>Delete</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type Tab = { value: string; label: string; Icon: typeof HouseIcon; badge?: string }

const TABS: Tab[] = [
  { value: 'home', label: 'Home', Icon: HouseIcon },
  { value: 'play', label: 'Play', Icon: PlayIcon },
  { value: 'categories', label: 'Categories', Icon: GridIcon },
  { value: 'account', label: 'Account', Icon: AccountIcon },
  { value: 'cart', label: 'Cart', Icon: CartIcon, badge: '1' },
]

function TabBarDemo() {
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
            badge={badge ? <TabBarBadge><Text>{badge}</Text></TabBarBadge> : undefined}
          />
        ))}
      </TabBar>
      <Text className="text-xs text-muted-foreground">
        Tap a tab, or hold and slide across the bar.
      </Text>
    </View>
  )
}

function TactileButtonDemo() {
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

export const demos: Record<string, React.ComponentType> = {
  avatar: AvatarDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  card: CardDemo,
  checkbox: CheckboxDemo,
  dialog: DialogDemo,
  input: InputDemo,
  'input-group': InputGroupDemo,
  'input-otp': InputOTPDemo,
  label: LabelDemo,
  separator: SeparatorDemo,
  skeleton: SkeletonDemo,
  switch: SwitchDemo,
  'tab-bar': TabBarDemo,
  textarea: TextareaDemo,
  'tactile-button': TactileButtonDemo,
  text: TextDemo,
}

export const demoNames = Object.keys(demos)
