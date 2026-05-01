import { Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

export function Heading({ children, depth = 1 }: { children: ReactNode; depth?: number }) {
  const fontSize = 24 - (depth - 1) * 3
  return (
    <View>
      <Text style={{ fontSize, fontWeight: 'bold' }}>{children}</Text>
    </View>
  )
}
