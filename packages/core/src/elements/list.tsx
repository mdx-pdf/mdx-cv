/* @jsxRuntime automatic */
import { Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

import { markAsBlock, renderMixed, stripWhitespaceNodes } from './utils.js'

export function List({ children }: { children: ReactNode }) {
  return (
    <View style={{ marginLeft: 10, border: '1px solid black', padding: 4 }}>
      {stripWhitespaceNodes(children)}
    </View>
  )
}

export const UL = ({ children }: { children: ReactNode }) => <List>{children}</List>
export const OL = ({ children }: { children: ReactNode }) => <List>{children}</List>

// Register as block-level so renderMixed routes them outside <Text>
markAsBlock(UL)
markAsBlock(OL)

export function ListItem({ children }: { children: ReactNode }) {
  // renderMixed separates inline nodes (→ <Text>) from block nodes (→ direct),
  // handling any nesting depth without explicit type checks.
  const [first, ...rest] = renderMixed(children)

  return (
    <View style={{ border: '1px dashed blue', margin: 2, padding: 1 }}>
      {/* Prepend bullet to the first segment (always a <Text> from renderMixed) */}
      <Text>
        &middot;{' '}
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
