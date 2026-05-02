/* @jsxRuntime automatic */
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { isValidElement } from 'react'
import { renderMixed } from './utils.js'

const defaultStyle = StyleSheet.create({
  paragraph: {
    padding: 1,
    fontSize: 8,
    marginBottom: 8,
    border: '1px solid blue',
  },
})

export function Paragraph({ children }: { children: ReactNode }) {
  const mixed = renderMixed(children)
  // If renderMixed produced a single Text node, apply paragraph style to it
  if (mixed.length === 1) {
    const [only] = mixed
    if (isValidElement<{ children: ReactNode }>(only) && only.type === Text) {
      return (
        <View>
          <Text style={defaultStyle.paragraph}>{only.props.children}</Text>
        </View>
      )
    }
  }
  return <View style={{ border: '1px solid green' }}>{mixed}</View>
}
