import { Text } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

export function Strong({ children }: { children: ReactNode }) {
  return <Text style={{ fontWeight: 'bold' }}>{children}</Text>
}
