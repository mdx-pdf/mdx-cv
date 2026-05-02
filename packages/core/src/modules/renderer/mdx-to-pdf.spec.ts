import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadJsx } from './load-jsx.js'
import { mdxToJsx } from './mdx-to-jsx.js'
import { renderMdxToPdf } from './mdx-to-pdf.js'

const DUMMY_BASE_URL = pathToFileURL('/tmp/dummy.mdx')

async function compileAndLoad(mdx: string) {
  const jsx = await mdxToJsx(mdx)
  return loadJsx(jsx, DUMMY_BASE_URL)
}

describe('renderMdxToPdf', () => {
  it('returns a NodeJS ReadableStream', async () => {
    const Component = await compileAndLoad('# Hello PDF')
    const stream = await renderMdxToPdf(Component, {})
    expect(stream).toBeDefined()
    expect(typeof stream.pipe).toBe('function')
  })

  it('accepts lang option without throwing', async () => {
    const Component = await compileAndLoad('Hello')
    const stream = await renderMdxToPdf(Component, { lang: 'en' })
    expect(stream).toBeDefined()
  })

  it('accepts pageSize option without throwing', async () => {
    const Component = await compileAndLoad('Hello')
    const stream = await renderMdxToPdf(Component, { pageSize: 'LETTER' })
    expect(stream).toBeDefined()
  })
})
