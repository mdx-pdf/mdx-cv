import { Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { Children, isValidElement } from 'react'

import { stripWhitespaceNodes } from './utils.js'

export function List({ children }: { children: ReactNode }) {
  return (
    <View style={{ marginLeft: 10, border: '1px solid black', padding: 4 }}>
      {stripWhitespaceNodes(children)}
    </View>
  )
}

export const ul = ({ children }: { children: ReactNode }) => <List>{children}</List>
ul.displayName = 'ul'
export const ol = ({ children }: { children: ReactNode }) => <List>{children}</List>
ol.displayName = 'ol'

export function ListItem({ children }: { children: ReactNode }) {
  const childArray = Children.toArray(children)

  const textNodes = childArray.filter((child) => {
    return !(isValidElement(child) && child.type === ul)
  })

  const subLists = childArray.filter((child) => {
    return isValidElement(child) && child.type === ul
  })

  return (
    <View style={{ border: '1px dashed blue', margin: 2, padding: 1 }}>
      <Text>&middot; {textNodes}</Text>
      {subLists}
    </View>
  )
}
