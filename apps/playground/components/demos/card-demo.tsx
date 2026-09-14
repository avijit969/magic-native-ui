import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/ui/card'
import { Text } from '@/registry/ui/text'

export function CardDemo() {
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
