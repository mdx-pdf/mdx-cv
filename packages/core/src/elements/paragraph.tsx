import { Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <View>
      <Text style={{ fontSize: 8, marginBottom: 8 }}>{children}</Text>
    </View>
  )
}
