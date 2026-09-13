import * as React from 'react'
import { View } from 'react-native'

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
import { Label } from '@/registry/ui/label'
import { Separator } from '@/registry/ui/separator'
import { Skeleton } from '@/registry/ui/skeleton'
import { Switch } from '@/registry/ui/switch'
import { Text } from '@/registry/ui/text'

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
    <View className="w-full gap-1.5">
      <Label nativeID="email">Email</Label>
      <Input placeholder="you@example.com" aria-labelledby="email" />
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

export const demos: Record<string, React.ComponentType> = {
  avatar: AvatarDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  card: CardDemo,
  checkbox: CheckboxDemo,
  dialog: DialogDemo,
  input: InputDemo,
  label: LabelDemo,
  separator: SeparatorDemo,
  skeleton: SkeletonDemo,
  switch: SwitchDemo,
  text: TextDemo,
}

export const demoNames = Object.keys(demos)
