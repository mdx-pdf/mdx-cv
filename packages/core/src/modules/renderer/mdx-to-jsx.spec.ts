import { describe, expect, it } from 'vitest'
import { mdxToJsx } from './mdx-to-jsx.js'

describe('mdxToJsx', () => {
  it('converts MDX to JSX', async () => {
    const input = `
# Hello MDX

This is a test of MDX to JSX conversion.

- Item 1
- Item 2
- Item 3
`

    const result = await mdxToJsx(input)

    expect(result).toContain('Hello MDX')
  })
})
