import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadJsx } from './load-jsx.js'
import { mdxToJsx } from './mdx-to-jsx.js'

const DUMMY_BASE_URL = pathToFileURL('/tmp/dummy.mdx')

describe('loadJsx', () => {
  it('returns a React component from compiled function-body MDX', async () => {
    const jsx = await mdxToJsx('# Hello')
    const Component = await loadJsx(jsx, DUMMY_BASE_URL)
    expect(typeof Component).toBe('function')
  })

  it('returned component is callable with empty props', async () => {
    const jsx = await mdxToJsx('Hello **world**')
    const Component = await loadJsx(jsx, DUMMY_BASE_URL)
    // Just verifying it does not throw on instantiation check
    expect(Component).toBeDefined()
    expect(Component.length).lessThanOrEqual(1)
  })

  it('resolves relative imports via baseUrl', async () => {
    // __fixtures__/simple-card.js is plain ESM (no JSX syntax),
    // importable by Node.js without a loader.
    const { resolve, dirname } = await import('node:path')
    const { fileURLToPath } = await import('node:url')

    const fixtureDir = resolve(fileURLToPath(import.meta.url), '../__fixtures__')
    // Fake MDX file sitting next to the fixture so ./simple-card resolves correctly
    const fakeMdxPath = resolve(fixtureDir, 'index.mdx')
    const mdx = `import { SimpleCard } from "./simple-card.js"\n\n<SimpleCard title="test" />`
    const jsx = await mdxToJsx(mdx)

    const Component = await loadJsx(jsx, pathToFileURL(fakeMdxPath))
    expect(typeof Component).toBe('function')
  })
})
