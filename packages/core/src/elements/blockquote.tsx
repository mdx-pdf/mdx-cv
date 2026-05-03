/* @jsxRuntime automatic */
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

import { markAsBlock } from './utils.js'

const defaultStyle = StyleSheet.create({
  blockquote: {
    fontSize: 10,
    borderLeft: '2px solid #ccc',
    marginBottom: 8,
    paddingLeft: 10,
  },
  debug: {
    // border: '1px solid red',
  },
})

export function Blockquote({ children }: { children: ReactNode }) {
  return (
    <View>
      <Text style={[defaultStyle.blockquote, defaultStyle.debug]}>{children}</Text>
    </View>
  )
}
markAsBlock(Blockquote)
