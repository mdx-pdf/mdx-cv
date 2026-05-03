/* @jsxRuntime automatic */
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { isValidElement } from 'react'

import { renderMixed } from './utils.js'

const defaultStyle = StyleSheet.create({
  paragraph: {
    fontSize: 10,
    marginVertical: 5,
    // lineHeight: 1.6,
  },
  text: {},
  debug: {
    border: '1px solid red',
  },
})

export function Paragraph({ children }: { children: ReactNode }) {
  const mixed = renderMixed(children)
  // If renderMixed produced a single Text node, apply paragraph style to it
  if (mixed.length === 1) {
    const [only] = mixed
    if (isValidElement<{ children: ReactNode }>(only) && only.type === Text) {
      return (
        <View style={defaultStyle.paragraph}>
          <Text style={[defaultStyle.text, defaultStyle.debug]}>{only.props.children}</Text>
        </View>
      )
    }
  }
  return <View style={defaultStyle.paragraph}>{mixed}</View>
}
