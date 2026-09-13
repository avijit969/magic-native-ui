import * as React from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Uniwind, useUniwind } from 'uniwind'

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
    </ScrollView>
  )
}
