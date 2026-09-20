import { View } from 'react-native'
import { Info, TriangleAlert } from 'lucide-react-native'

import { Alert, AlertContent, AlertDescription, AlertTitle } from '@/registry/ui/alert'
import { iconWithClassName } from '@/registry/lib/icons'

const InfoIcon = iconWithClassName(Info)
const WarningIcon = iconWithClassName(TriangleAlert)

export function AlertDemo() {
  return (
    <View className="w-full gap-3">
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
    </View>
  )
}
