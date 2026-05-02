import { loadJsx } from './load-jsx.js'
import { mdxToJsx } from './mdx-to-jsx.js'
import { renderMdxToPdf } from './mdx-to-pdf.js'
import type { WrapProps } from './Wrap.js'

export type RendererOptions = Omit<WrapProps, 'children'> & {
  debugfile?: boolean
  lang?: string
}

// mdx: MDX source string
// baseUrl: file:// URL of the MDX file (used to resolve relative imports inside MDX)
export async function basicRenderer(mdx: string, baseUrl: URL, options: RendererOptions = {}) {
  const jsx = await mdxToJsx(mdx)
  if (options.debugfile) {
    const { writeFile } = await import('node:fs/promises')
    await writeFile('output.debug.jsx', jsx)
  }
  const MDXComponent = await loadJsx(jsx, baseUrl)

  return renderMdxToPdf(MDXComponent, options)
}
