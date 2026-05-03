/* @jsxRuntime automatic */
import { View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

import { stripWhitespaceNodes } from './utils.js'

export function DocRoot({ children }: { children: ReactNode }) {
  return <View style={{ fontSize: 10 }}>{stripWhitespaceNodes(children)}</View>
}
