import { Text } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { Children, cloneElement, createContext, isValidElement, useContext } from 'react'

/**
 * Provides the file:// URL of the MDX source file so components like
 * ImageComponent can resolve relative asset paths.
 */
export const MdxBaseUrlContext = createContext<URL | null>(null)

export function useMdxBaseUrl(): URL | null {
  return useContext(MdxBaseUrlContext)
}

export function stripWhitespaceNodes(node: ReactNode): ReactNode {
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

// Registry of components that produce a <View> (block-level in react-pdf terms).
// Register with markAsBlock(); query via isBlock().
const blockRegistry = new WeakSet<object>()
export function markAsBlock(component: object) {
  blockRegistry.add(component)
}

function isBlock(node: ReactNode): boolean {
  return isValidElement(node) && typeof node.type === 'function' && blockRegistry.has(node.type)
}

/**
 * Splits mixed children into runs of inline nodes wrapped in <Text>
 * and block nodes passed through directly.
 *
 * react-pdf requires:
 *   - inline content (strings, <Strong>, <Link>…) inside <Text>
 *   - block content (<View>-based components) outside <Text>
 *
 * renderMixed handles any combination automatically.
 */
export function renderMixed(children: ReactNode): ReactNode[] {
  const nodes = Children.toArray(children)
  const result: ReactNode[] = []
  let inlineBuffer: ReactNode[] = []

  const flushInline = () => {
    if (inlineBuffer.length === 0) return
    result.push(<Text key={`inline-${result.length}`}>{inlineBuffer}</Text>)
    inlineBuffer = []
  }

  for (const node of nodes) {
    if (isBlock(node)) {
      flushInline()
      result.push(node)
    } else {
      inlineBuffer.push(node)
    }
  }
  flushInline()

  return result
}
