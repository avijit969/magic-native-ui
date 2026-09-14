import * as React from 'react'

import { Button } from '@/registry/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/ui/dialog'
import { Text } from '@/registry/ui/text'

export function DialogDemo() {
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
