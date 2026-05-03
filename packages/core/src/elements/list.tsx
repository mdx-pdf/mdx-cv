/* @jsxRuntime automatic */
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { Children, cloneElement, createContext, isValidElement, useContext } from 'react'

import { markAsBlock, renderMixed, stripWhitespaceNodes } from './utils.js'

type ListType = 'ul' | 'ol'
const ListTypeContext = createContext<ListType>('ul')

const defaultStyle = StyleSheet.create({
  list: {
    paddingLeft: 10,
  },
  listItem: {},
})

export function List({ children }: { children: ReactNode }) {
  return <View style={defaultStyle.list}>{stripWhitespaceNodes(children)}</View>
}

export const UL = ({ children }: { children: ReactNode }) => (
  <ListTypeContext.Provider value="ul">
    <List>{children}</List>
  </ListTypeContext.Provider>
)

export const OL = ({ children }: { children: ReactNode }) => (
  <ListTypeContext.Provider value="ol">
    <List>{injectOrderedIndex(children)}</List>
  </ListTypeContext.Provider>
)

// Register as block-level so renderMixed routes them outside <Text>
markAsBlock(UL)
markAsBlock(OL)

interface ListItemProps {
  children: ReactNode
  listIndex?: number
}
export function ListItem({ children, listIndex }: ListItemProps) {
  const listType = useContext(ListTypeContext)
  const marker = listType === 'ol' ? `${listIndex ?? 1}.` : '\u00b7'

  // renderMixed separates inline nodes (→ <Text>) from block nodes (→ direct),
  // handling any nesting depth without explicit type checks.
  const [first, ...rest] = renderMixed(children)

  return (
    <View style={defaultStyle.listItem}>
      {/* Prepend bullet to the first segment (always a <Text> from renderMixed) */}
      <Text>
        {marker}{' '}
        {isRPText(first)
          ? (first as React.ReactElement<{ children: ReactNode }>).props.children
          : first}
      </Text>
      {rest}
    </View>
  )
}

function isRPText(node: ReactNode): node is React.ReactElement {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as React.ReactElement).type === Text
  )
}

function injectOrderedIndex(children: ReactNode): ReactNode {
  let index = 0
  return Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child
    }

    if (child.type === ListItem) {
      index += 1
      return cloneElement(child as React.ReactElement<ListItemProps>, { listIndex: index })
    }

    return child
  })
}
