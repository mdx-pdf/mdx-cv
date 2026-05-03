/* @jsxRuntime automatic */
import { StyleSheet, Text } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

const defaultStyle = StyleSheet.create({
  strong: {
    fontWeight: 'bold',
  },
})

export function Strong({ children }: { children: ReactNode }) {
  return <Text style={defaultStyle.strong}>{children}</Text>
}
