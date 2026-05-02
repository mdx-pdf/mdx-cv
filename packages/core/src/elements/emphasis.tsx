/* @jsxRuntime automatic */
import { Text } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

export function Emphasis({ children }: { children: ReactNode }) {
  return <Text style={{ fontStyle: 'italic' }}>{children}</Text>
}
