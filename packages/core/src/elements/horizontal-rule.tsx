/* @jsxRuntime automatic */
import { StyleSheet, View } from '@react-pdf/renderer'

const defaultStyle = StyleSheet.create({
  horizontalRule: {
    marginVertical: 8,
    borderBottom: '1px solid #ccc',
  },
})

export function HorizontalRule() {
  return <View style={defaultStyle.horizontalRule}></View>
}
