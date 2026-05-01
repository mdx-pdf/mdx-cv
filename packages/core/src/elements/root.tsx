import { View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

import { stripWhitespaceNodes } from './utils.js'

export function DocRoot({ children }: { children: ReactNode }) {
  return <View style={{ fontSize: 8 }}>{stripWhitespaceNodes(children)}</View>
}
