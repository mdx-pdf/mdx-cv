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

export const ReactPDFComponentMap = {
  h1: (props: { children: ReactNode }) => (
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{props.children}</Text>
  ),
  strong: (props: { children: ReactNode }) => (
    <Text style={{ fontWeight: 'bold' }}>{props.children}</Text>
  ),
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
