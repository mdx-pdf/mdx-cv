/* @jsxRuntime automatic */
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

import { markAsBlock } from './utils.js'

const defaultStyle = StyleSheet.create({
  blockcode: {
    fontSize: 10,
    borderLeft: '2px solid #ccc',
    paddingLeft: 8,
  },
  inlinecode: {
    fontSize: 10,
    fontFamily: 'Courier',
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
markAsBlock(BlockCode)

export function InlineCode({ children }: { children: ReactNode }) {
  return <Text style={defaultStyle.inlinecode}>{children}</Text>
}
