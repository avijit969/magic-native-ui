import * as React from 'react'
import { Pressable, View } from 'react-native'

import { Label } from '@/registry/ui/label'
import { RadioGroup, RadioGroupItem } from '@/registry/ui/radio-group'

const PLANS = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
]

export function RadioGroupDemo() {
  const [plan, setPlan] = React.useState('pro')

  return (
    <RadioGroup value={plan} onValueChange={setPlan} className="w-full">
      {PLANS.map((option) => (
        // The label is pressable too, so the whole row is a target rather than
        // just the 20pt dot.
        <Pressable
          key={option.value}
          onPress={() => setPlan(option.value)}
          className="flex-row items-center gap-3"
        >
          <RadioGroupItem value={option.value} />
          <Label>{option.label}</Label>
        </Pressable>
      ))}
    </RadioGroup>
  )
}
