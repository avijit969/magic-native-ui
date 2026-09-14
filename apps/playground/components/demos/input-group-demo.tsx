import * as React from 'react'
import { Pressable, View } from 'react-native'
import { AtSign, Eye, EyeOff, Search } from 'lucide-react-native'

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/ui/input-group'
import { Text } from '@/registry/ui/text'
import { iconWithClassName } from '@/registry/lib/icons'

const AtSignIcon = iconWithClassName(AtSign)
const EyeIcon = iconWithClassName(Eye)
const EyeOffIcon = iconWithClassName(EyeOff)
const SearchIcon = iconWithClassName(Search)

export function InputGroupDemo() {
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
