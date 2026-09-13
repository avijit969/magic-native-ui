import * as React from 'react'
import { useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { Uniwind } from 'uniwind'

import { demoNames, demos } from '@/components/demos'
import { Text } from '@/registry/ui/text'

/** One static HTML file per component, so the docs site can iframe each one. */
export async function generateStaticParams() {
  return demoNames.map((name) => ({ name }))
}

export default function Preview() {
  const { name, theme } = useLocalSearchParams<{ name: string; theme?: string }>()

  // The static export is served as `preview/button.html`, so on hydration the
  // router reports the file name rather than the route segment. Dev serves it
  // without the extension, hence stripping rather than assuming either form.
  const key = typeof name === 'string' ? name.replace(/\.html$/, '') : undefined
  const Demo = key ? demos[key] : undefined

  // The docs page passes ?theme=dark so the preview matches the surrounding page.
  React.useEffect(() => {
    if (theme === 'dark' || theme === 'light') {
      Uniwind.setTheme(theme)
    }
  }, [theme])

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      {Demo ? (
        <View className="w-full max-w-sm items-center">
          <Demo />
        </View>
      ) : (
        <Text className="text-muted-foreground">Unknown component: {String(key ?? name)}</Text>
      )}
    </View>
  )
}
