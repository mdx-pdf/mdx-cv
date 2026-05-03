import { pathToFileURL } from 'node:url'
import type { ReactNode } from 'react'
import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { basicRenderer } from '../modules/renderer/index.js'
import { loadJsx } from '../modules/renderer/load-jsx.js'
import { mdxToJsx } from '../modules/renderer/mdx-to-jsx.js'
import { ListItem, OL } from './list.js'

const DUMMY_BASE_URL = pathToFileURL('/tmp/dummy.mdx')

interface IndexedListItemProps {
  listIndex?: number
  children?: ReactNode
}

// Walk a React element tree and collect listIndex props from all ListItem elements
// found at any depth.  Calling OL() directly gives us the post-injectOrderedIndex
// element tree, so indices are visible without going through React rendering.
function collectListIndexes(node: ReactNode): number[] {
  const result: number[] = []

  const walk = (current: ReactNode) => {
    if (Array.isArray(current)) {
      for (const item of current) walk(item)
      return
    }
    if (!isValidElement<{ children?: ReactNode }>(current)) return

    if (current.type === ListItem) {
      result.push((current.props as IndexedListItemProps).listIndex ?? -1)
    }

    if (current.props.children != null) {
      walk(current.props.children)
    }
  }

  walk(node)
  return result
}

describe('ordered list numbering', () => {
  it('numbers direct ListItem children 1, 2, 3', () => {
    const tree = OL({
      children: [
        <ListItem key="a">A</ListItem>,
        <ListItem key="b">B</ListItem>,
        <ListItem key="c">C</ListItem>,
      ],
    })

    expect(collectListIndexes(tree)).toEqual([1, 2, 3])
  })

  it('nested OL gets independent numbering starting from 1', () => {
    // Pre-render the inner OL by calling OL() directly — this simulates what
    // React does when it renders the inner OL element during real rendering.
    // The inner OL assigns its own indices 1, 2 independently.
    const innerOL = OL({
      children: [<ListItem key="b1">B1</ListItem>, <ListItem key="b2">B2</ListItem>],
    })

    const tree = OL({
      children: [
        <ListItem key="a">A</ListItem>,
        // innerOL is already processed (listIndex 1, 2) — outer OL must NOT
        // re-number these items when assigning its own index to ListItem(B).
        <ListItem key="b">B{innerOL}</ListItem>,
        <ListItem key="c">C</ListItem>,
      ],
    })

    // Outer items: 1, 2, 3
    // Inner items (from pre-rendered inner OL, inside ListItem(B)): 1, 2
    // Full traversal order: [outer-A=1, outer-B=2, inner-B1=1, inner-B2=2, outer-C=3]
    expect(collectListIndexes(tree)).toEqual([1, 2, 1, 2, 3])
  })
})

describe('ordered list integration', () => {
  it('MDX with nested ordered list renders without error', async () => {
    const mdx = ['1. Item A', '2. Item B', '   1. Nested 1', '   2. Nested 2', '3. Item C'].join(
      '\n',
    )

    const stream = await basicRenderer(mdx, DUMMY_BASE_URL)
    expect(typeof stream.pipe).toBe('function')
  })

  // CommonMark requires nested list content to be indented by at least the list
  // marker width. For `3. ` that is 3 characters, so sub-lists need 3+ spaces.
  // With only 2 spaces the parser treats the sub-items as flat items of the outer list.
  it('2-space indent parses as FLAT list (CommonMark limitation)', async () => {
    const mdx2 = ['1. A', '2. B', '  1. B1', '  2. B2', '3. C'].join('\n')
    const compiled = await mdxToJsx(mdx2)
    // All items land in a single ol call → the compiled output contains only one
    // top-level _components.ol and all li elements are its direct children.
    // We verify by checking there is no ol nested inside an li children array.
    const hasNestedOL =
      /\bchildren:\s*\[[^\]]*_components\.ol/s.test(compiled) ||
      /\bchildren:\s*"[^"]*".*_components\.ol/s.test(compiled)
    expect(hasNestedOL).toBe(false)
  })

  it('3-space indent parses as NESTED list', async () => {
    const mdx3 = ['1. A', '2. B', '   1. B1', '   2. B2', '3. C'].join('\n')
    const compiled = await mdxToJsx(mdx3)
    // With proper indent, the inner ol appears inside the children of an li element.
    // The compiled output will contain _components.ol after a _components.li children.
    const hasNestedOL = /children:\s*\[[^)]*_components\.ol/s.test(compiled)
    expect(hasNestedOL).toBe(true)
  })

  it('3-space nested ordered list components: outer gets 1,2,3 — inner gets 1,2', async () => {
    const mdx = ['1. A', '2. B', '   1. B1', '   2. B2', '3. C'].join('\n')
    const Component = await loadJsx(await mdxToJsx(mdx), DUMMY_BASE_URL)
    const tree = (Component as unknown as (p: Record<string, never>) => ReactNode)({})
    const indexes = collectListIndexes(tree)
    // Outer: A=1, B=2, C=3 — Inner: B1=1, B2=2
    // Tree traversal visits outer ListItem children first, inner after.
    expect(indexes).toEqual([1, 2, 1, 2, 3])
  })
})
