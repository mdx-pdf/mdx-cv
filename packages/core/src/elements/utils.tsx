import type { ReactNode } from 'react'
import { Children, cloneElement, isValidElement } from 'react'

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
