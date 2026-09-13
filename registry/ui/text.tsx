import * as React from 'react'
import { Text as RNText } from 'react-native'

import { cn } from '@/registry/lib/utils'

/**
 * React Native has no CSS inheritance, so a `<Text>` nested inside a styled
 * parent knows nothing about that parent's colour or size. Components like
 * Button and Badge publish their text classes through this context instead,
 * which is what lets `<Button><Text>Save</Text></Button>` render correctly.
 */
const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({ className, ...props }: React.ComponentProps<typeof RNText>) {
  const textClass = React.useContext(TextClassContext)

  return <RNText className={cn('text-base text-foreground', textClass, className)} {...props} />
}

export { Text, TextClassContext }
