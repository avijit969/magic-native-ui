/**
 * One usage example per component. Each file stands on its own — the docs site
 * ships these sources as the "Usage" code beside every preview, so a reader can
 * paste one into an app without chasing shared helpers.
 */
import type * as React from 'react'

import { AvatarDemo } from './avatar-demo'
import { BadgeDemo } from './badge-demo'
import { ButtonDemo } from './button-demo'
import { CardDemo } from './card-demo'
import { CheckboxDemo } from './checkbox-demo'
import { DialogDemo } from './dialog-demo'
import { InputDemo } from './input-demo'
import { InputGroupDemo } from './input-group-demo'
import { InputOTPDemo } from './input-otp-demo'
import { LabelDemo } from './label-demo'
import { SeparatorDemo } from './separator-demo'
import { SkeletonDemo } from './skeleton-demo'
import { SwitchDemo } from './switch-demo'
import { TabBarDemo } from './tab-bar-demo'
import { TactileButtonDemo } from './tactile-button-demo'
import { TextDemo } from './text-demo'
import { TextareaDemo } from './textarea-demo'

/** Keys are registry item names, so `preview/<name>` matches `add <name>`. */
export const demos: Record<string, React.ComponentType> = {
  avatar: AvatarDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  card: CardDemo,
  checkbox: CheckboxDemo,
  dialog: DialogDemo,
  input: InputDemo,
  'input-group': InputGroupDemo,
  'input-otp': InputOTPDemo,
  label: LabelDemo,
  separator: SeparatorDemo,
  skeleton: SkeletonDemo,
  switch: SwitchDemo,
  'tab-bar': TabBarDemo,
  'tactile-button': TactileButtonDemo,
  text: TextDemo,
  textarea: TextareaDemo,
}

export const demoNames = Object.keys(demos)
