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
  return <View>{stripWhitespaceNodes(children)}</View>
}

function Heading({ children, depth = 1 }: { children: ReactNode; depth?: number }) {
  const fontSize = 24 - (depth - 1) * 2
  return <Text style={{ fontSize, fontWeight: 'bold' }}>{children}</Text>
}

function Strong({ children }: { children: ReactNode }) {
  return <Text style={{ fontWeight: 'bold' }}>{children}</Text>
}

function Emphasis({ children }: { children: ReactNode }) {
  return <Text style={{ fontStyle: 'italic' }}>{children}</Text>
}

export const ReactPDFComponentMap = {
  h1: ({ children }: { children: ReactNode }) => <Heading depth={1}>{children}</Heading>,
  h2: ({ children }: { children: ReactNode }) => <Heading depth={2}>{children}</Heading>,
  h3: ({ children }: { children: ReactNode }) => <Heading depth={3}>{children}</Heading>,
  h4: ({ children }: { children: ReactNode }) => <Heading depth={4}>{children}</Heading>,
  h5: ({ children }: { children: ReactNode }) => <Heading depth={5}>{children}</Heading>,
  h6: ({ children }: { children: ReactNode }) => <Heading depth={6}>{children}</Heading>,
  strong: ({ children }: { children: ReactNode }) => <Strong>{children}</Strong>,
  em: ({ children }: { children: ReactNode }) => <Emphasis>{children}</Emphasis>,
  p: (props: { children: ReactNode }) => <Text style={{ fontSize: 12 }}>{props.children}</Text>,
  ul: (props: { children: ReactNode }) => (
    <View style={{ border: '1px solid black' }}>{stripWhitespaceNodes(props.children)}</View>
  ),
  li: (props: { children: ReactNode }) => (
    <Text
      style={{
        fontSize: 12,
        marginLeft: 10,
        border: '1px solid blue',
      }}
    >
      - {props.children}
    </Text>
  ),
  a: (props: { children: ReactNode; href: string }) => (
    <Link src={props.href} style={{ fontSize: 12, color: 'blue' }}>
      {props.children}
    </Link>
  ),
  wrapper: PdfRoot,
}
