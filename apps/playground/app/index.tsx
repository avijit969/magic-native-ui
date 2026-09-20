import * as React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Uniwind, useUniwind } from 'uniwind'
import {
  ChevronDown,
  CircleUserRound,
  Eye,
  EyeOff,
  Heart,
  House,
  Info,
  LayoutGrid,
  PlayCircle,
  Search,
  ShoppingCart,
  TriangleAlert,
} from 'lucide-react-native'

import { Alert, AlertContent, AlertDescription, AlertTitle } from '@/registry/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/ui/avatar'
import { Badge } from '@/registry/ui/badge'
import { Button } from '@/registry/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/registry/ui/card'
import { Checkbox } from '@/registry/ui/checkbox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/registry/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/ui/dropdown-menu'
import { Input } from '@/registry/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/ui/input-group'
import { InputOTP } from '@/registry/ui/input-otp'
import { Label } from '@/registry/ui/label'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/registry/ui/popover'
import { Progress } from '@/registry/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/registry/ui/radio-group'
import { Separator } from '@/registry/ui/separator'
import { Skeleton } from '@/registry/ui/skeleton'
import { Switch } from '@/registry/ui/switch'
import { TabBar, TabBarBadge, TabBarItem } from '@/registry/ui/tab-bar'
import { TactileButton } from '@/registry/ui/tactile-button'
import { Textarea } from '@/registry/ui/textarea'
import { Text } from '@/registry/ui/text'
import { iconWithClassName } from '@/registry/lib/icons'

const EyeIcon = iconWithClassName(Eye)
const EyeOffIcon = iconWithClassName(EyeOff)
const SearchIcon = iconWithClassName(Search)
const HouseIcon = iconWithClassName(House)
const PlayIcon = iconWithClassName(PlayCircle)
const GridIcon = iconWithClassName(LayoutGrid)
const AccountIcon = iconWithClassName(CircleUserRound)
const CartIcon = iconWithClassName(ShoppingCart)
const ChevronDownIcon = iconWithClassName(ChevronDown)
const InfoIcon = iconWithClassName(Info)
const WarningIcon = iconWithClassName(TriangleAlert)

type Tab = { value: string; label: string; Icon: typeof HouseIcon; badge?: string }

const TABS: Tab[] = [
  { value: 'home', label: 'Home', Icon: HouseIcon },
  { value: 'play', label: 'Play', Icon: PlayIcon },
  { value: 'categories', label: 'Categories', Icon: GridIcon },
  { value: 'account', label: 'Account', Icon: AccountIcon },
  { value: 'cart', label: 'Cart', Icon: CartIcon, badge: '1' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-xl font-semibold">{title}</Text>
      {children}
    </View>
  )
}

export default function Gallery() {
  const { theme } = useUniwind()
  const insets = useSafeAreaInsets()
  const [checked, setChecked] = React.useState(false)
  const [enabled, setEnabled] = React.useState(true)
  const [open, setOpen] = React.useState(false)
  const [password, setPassword] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [tab, setTab] = React.useState<string>('home')
  const [progress, setProgress] = React.useState(45)
  const [plan, setPlan] = React.useState('pro')
  const [compact, setCompact] = React.useState(true)

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-7 p-5"
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 48 }}
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold">Magic Native UI</Text>
        <Text className="text-muted-foreground">Theme: {theme}</Text>
      </View>

      <Button
        variant="outline"
        onPress={() => Uniwind.setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Text>Toggle theme</Text>
      </Button>

      <Separator />

      <Section title="Button">
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
        <View className="flex-row items-center gap-2">
          <Button size="sm">
            <Text>Small</Text>
          </Button>
          <Button size="lg">
            <Text>Large</Text>
          </Button>
        </View>
        <Button disabled>
          <Text>Disabled</Text>
        </Button>
      </Section>

      <Section title="Tactile Button">
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
      </Section>

      <Section title="Badge">
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
      </Section>

      <Section title="Card">
        <Card>
          <CardHeader>
            <CardTitle>Project settings</CardTitle>
            <CardDescription>Manage how this project behaves.</CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="gap-1.5">
              <Label nativeID="project-name">Name</Label>
              <Input placeholder="acme-app" aria-labelledby="project-name" />
            </View>
          </CardContent>
          <CardFooter>
            <Button size="sm">
              <Text>Save</Text>
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Tab Bar">
        <TabBar value={tab} onValueChange={setTab}>
          {TABS.map(({ value, label, Icon, badge }) => (
            <TabBarItem
              key={value}
              value={value}
              label={label}
              icon={({ selected }) => (
                <Icon size={20} className={selected ? 'text-primary' : 'text-muted-foreground'} />
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
        <Text className="text-muted-foreground">Tap a tab, or hold and slide across the bar.</Text>
      </Section>

      <Section title="Input">
        <View className="gap-1.5">
          <Label nativeID="email">Email</Label>
          <Input
            placeholder="you@example.com"
            aria-labelledby="email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <Input variant="filled" placeholder="Filled" />
        <Input variant="underline" placeholder="Underline" />
        <Input variant="ghost" placeholder="Ghost" />
        <Input size="sm" placeholder="Small" />
        <Input size="lg" placeholder="Large" />
        <View className="gap-1.5">
          <Input invalid defaultValue="not-an-email" />
          <Text className="text-xs text-destructive">Enter a valid email address.</Text>
        </View>
        <Input editable={false} placeholder="Disabled" />
      </Section>

      <Section title="Input Group">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon size={16} className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search components" />
        </InputGroup>
        <InputGroup>
          <InputGroupInput
            placeholder="Password"
            secureTextEntry={!password}
            autoCapitalize="none"
          />
          <InputGroupAddon>
            <Pressable
              onPress={() => setPassword(!password)}
              accessibilityLabel={password ? 'Hide password' : 'Show password'}
            >
              {password ? (
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
      </Section>

      <Section title="Textarea">
        <Textarea placeholder="Tell us about yourself" />
        <Textarea variant="filled" size="sm" placeholder="Filled, two lines high" />
      </Section>

      <Section title="Input OTP">
        <InputOTP value={code} onChangeText={setCode} />
        <Text className="text-muted-foreground">
          {code.length === 6 ? 'Ready to verify.' : `${code.length}/6 digits`}
        </Text>
        <InputOTP masked length={4} />
      </Section>

      <Section title="Avatar">
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
      </Section>

      <Section title="Switch & Checkbox">
        <View className="flex-row items-center gap-3">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          <Text>Notifications {enabled ? 'on' : 'off'}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          <Text>Accept terms</Text>
        </View>
      </Section>

      <Section title="Skeleton">
        <View className="flex-row items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </View>
        </View>
      </Section>

      <Section title="Dialog">
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
      </Section>

      <Section title="Alert">
        <Alert>
          <InfoIcon size={18} className="text-foreground" />
          <AlertContent>
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              Components are copied into your project, so you can edit them freely.
            </AlertDescription>
          </AlertContent>
        </Alert>
        <Alert variant="destructive">
          <WarningIcon size={18} className="text-destructive" />
          <AlertContent>
            <AlertTitle>Could not save</AlertTitle>
            <AlertDescription>Check your connection and try again.</AlertDescription>
          </AlertContent>
        </Alert>
      </Section>

      <Section title="Progress">
        <Progress value={progress} />
        <View className="flex-row gap-2">
          <Button
            size="sm"
            variant="outline"
            onPress={() => setProgress(Math.max(0, progress - 20))}
          >
            <Text>Less</Text>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => setProgress(Math.min(100, progress + 20))}
          >
            <Text>More</Text>
          </Button>
        </View>
      </Section>

      <Section title="Radio Group">
        <RadioGroup value={plan} onValueChange={setPlan}>
          {['starter', 'pro', 'team'].map((option) => (
            <Pressable
              key={option}
              onPress={() => setPlan(option)}
              className="flex-row items-center gap-3"
            >
              <RadioGroupItem value={option} />
              <Label>{option}</Label>
            </Pressable>
          ))}
        </RadioGroup>
      </Section>

      <Section title="Popover">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Text>Open popover</Text>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <View className="gap-3">
              <Text className="text-sm font-medium">Dimensions</Text>
              <Text className="text-xs text-muted-foreground">Set the size of the layer.</Text>
              <PopoverClose asChild>
                <Button size="sm">
                  <Text>Done</Text>
                </Button>
              </PopoverClose>
            </View>
          </PopoverContent>
        </Popover>
      </Section>

      <Section title="Dropdown Menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Text>Options</Text>
              <ChevronDownIcon size={16} className="text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Text>Profile</Text>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Text>Team</Text>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem checked={compact} onCheckedChange={setCompact}>
              <Text>Compact rows</Text>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Text>Sign out</Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="Context Menu">
        <ContextMenu>
          <ContextMenuTrigger>
            <View className="h-24 items-center justify-center rounded-md border border-dashed border-border">
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
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">
              <Text>Delete</Text>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Section>
    </ScrollView>
  )
}
