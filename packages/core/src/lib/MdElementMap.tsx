import { Link, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { Children, cloneElement, isValidElement } from 'react'

function stripWhitespaceNodes(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (typeof child === 'string') {
      return child.trim() === '' ? null : child
    }

    if (!isValidElement<{ children?: ReactNode }>(child)) {
      return child
    }

    if (!('children' in child.props) || child.props.children == null) {
      return child
    }

    return cloneElement(child, {
      children: stripWhitespaceNodes(child.props.children),
    })
  })
}

function PdfRoot({ children }: { children: ReactNode }) {
  return <View style={{ fontSize: 8 }}>{stripWhitespaceNodes(children)}</View>
}

function Heading({ children, depth = 1 }: { children: ReactNode; depth?: number }) {
  const fontSize = 24 - (depth - 1) * 3
  return <Text style={{ fontSize, fontWeight: 'bold' }}>{children}</Text>
}

function Paragraph({ children }: { children: ReactNode }) {
  return (
    <View>
      <Text style={{ fontSize: 8, marginBottom: 8 }}>{children}</Text>
    </View>
  )
}

function Strong({ children }: { children: ReactNode }) {
  return <Text style={{ fontWeight: 'bold' }}>{children}</Text>
}

function Emphasis({ children }: { children: ReactNode }) {
  return <Text style={{ fontStyle: 'italic' }}>{children}</Text>
}

function List({ children }: { children: ReactNode }) {
  return (
    <View style={{ marginLeft: 10, border: '1px solid black', padding: 4 }}>
      {stripWhitespaceNodes(children)}
    </View>
  )
}

const ul = ({ children }: { children: ReactNode }) => <List>{children}</List>
ul.displayName = 'ul'
const ol = ({ children }: { children: ReactNode }) => <List>{children}</List>
ol.displayName = 'ol'

function ListItem({ children }: { children: ReactNode }) {
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

export const ReactPDFComponentMap = {
  h1: ({ children }: { children: ReactNode }) => <Heading depth={1}>{children}</Heading>,
  h2: ({ children }: { children: ReactNode }) => <Heading depth={2}>{children}</Heading>,
  h3: ({ children }: { children: ReactNode }) => <Heading depth={3}>{children}</Heading>,
  h4: ({ children }: { children: ReactNode }) => <Heading depth={4}>{children}</Heading>,
  h5: ({ children }: { children: ReactNode }) => <Heading depth={5}>{children}</Heading>,
  h6: ({ children }: { children: ReactNode }) => <Heading depth={6}>{children}</Heading>,
  p: ({ children }: { children: ReactNode }) => <Paragraph>{children}</Paragraph>,
  ul,
  ol,
  li: ({ children }: { children: ReactNode }) => <ListItem>{children}</ListItem>,

  strong: ({ children }: { children: ReactNode }) => <Strong>{children}</Strong>,
  em: ({ children }: { children: ReactNode }) => <Emphasis>{children}</Emphasis>,
  a: (props: { children: ReactNode; href: string }) => (
    <Link src={props.href} style={{ fontSize: 8, color: 'blue' }}>
      {props.children}
    </Link>
  ),
  wrapper: PdfRoot,
}
