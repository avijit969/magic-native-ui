import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names and resolves conflicting Tailwind utilities so the last
 * one wins — `cn('p-2', 'p-4')` yields `p-4`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
