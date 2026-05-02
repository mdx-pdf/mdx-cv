import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { basicRenderer, Renderer } from './index.js'

const DUMMY_BASE_URL = pathToFileURL('/tmp/dummy.mdx')
const SIMPLE_MDX = '# Hello\n\nThis is **bold** text.'

describe('Renderer', () => {
  it('renderToPdf returns a readable stream', async () => {
    const renderer = new Renderer(SIMPLE_MDX, DUMMY_BASE_URL)
    const stream = await renderer.renderToPdf()
    expect(typeof stream.pipe).toBe('function')
  })

  it('accepts RendererOptions', async () => {
    const renderer = new Renderer(SIMPLE_MDX, DUMMY_BASE_URL, { lang: 'en', pageSize: 'A4' })
    const stream = await renderer.renderToPdf()
    expect(stream).toBeDefined()
  })

  it('writes debug file when debugfile option is set', async () => {
    const { unlink } = await import('node:fs/promises')
    const renderer = new Renderer(SIMPLE_MDX, DUMMY_BASE_URL, { debugfile: true })
    await renderer.renderToPdf()
    // File should have been written; clean up
    await unlink('output.debug.jsx')
  })

  it('works with MDX that has relative imports', async () => {
    const { resolve } = await import('node:path')
    const { fileURLToPath } = await import('node:url')

    // Use a plain-ESM fixture (no JSX syntax) so Node.js can import it without a loader
    const fixtureDir = resolve(fileURLToPath(import.meta.url), '../__fixtures__')
    const fakeMdxPath = resolve(fixtureDir, 'index.mdx')
    const mdx = `import { SimpleCard } from "./simple-card.js"\n\n<SimpleCard title="Renderer test" />`

    const renderer = new Renderer(mdx, pathToFileURL(fakeMdxPath))
    const stream = await renderer.renderToPdf()
    expect(typeof stream.pipe).toBe('function')
  })
})

describe('basicRenderer', () => {
  it('is a shorthand for new Renderer(...).renderToPdf()', async () => {
    const stream = await basicRenderer(SIMPLE_MDX, DUMMY_BASE_URL)
    expect(typeof stream.pipe).toBe('function')
  })
})
