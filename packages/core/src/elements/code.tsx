/* @jsxRuntime automatic */
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

const defaultStyle = StyleSheet.create({
  blockcode: {
    fontSize: 8,
    marginBottom: 8,
    borderLeft: '2px solid #ccc',
    paddingLeft: 8,
  },
  inlinecode: {
    fontFamily: 'Courier',
    fontSize: 8,
    backgroundColor: '#ffbcbc',
    color: '#ff004c',
  },
})

export function BlockCode({ children }: { children: ReactNode }) {
  return (
    <View>
      <Text style={defaultStyle.blockcode}>{children}</Text>
    </View>
  )
}

export function InlineCode({ children }: { children: ReactNode }) {
  return <Text style={defaultStyle.inlinecode}>{children}</Text>
}
