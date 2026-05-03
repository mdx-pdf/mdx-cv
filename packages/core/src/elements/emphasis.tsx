/* @jsxRuntime automatic */
import { StyleSheet, Text } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

const defaultStyle = StyleSheet.create({
  emphasis: {
    fontStyle: 'italic',
  },
})

export function Emphasis({ children }: { children: ReactNode }) {
  return <Text style={defaultStyle.emphasis}>{children}</Text>
}
