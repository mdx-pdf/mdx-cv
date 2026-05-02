/* @jsxRuntime automatic */
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

const defaultStyle = StyleSheet.create({
  blockquote: {
    fontSize: 8,
    marginBottom: 8,
    borderLeft: '2px solid #ccc',
    paddingLeft: 8,
  },
})

export function Blockquote({ children }: { children: ReactNode }) {
  return (
    <View>
      <Text style={defaultStyle.blockquote}>{children}</Text>
    </View>
  )
}
