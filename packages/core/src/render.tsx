/** WIP: Direct Convert MDX to React-PDF Tree, then output PDF */
/* @jsxRuntime automatic */
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { compile } from '@mdx-js/mdx'
import { MDXProvider } from '@mdx-js/react'
import { Document, Page, renderToFile } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

import { ElementMap } from './elements/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function convertMdxToReact(mdxContent: string, inputDir: string) {
  const result = await compile(mdxContent, {
    providerImportSource: '@mdx-js/react',
  })
  const code = String(result).replaceAll('"\\n"', 'null')
  // Rewrite relative imports (./foo, ../bar) to absolute file:// URLs so the
  // temp file can live in __dirname (for bare-import resolution) while still
  // being able to find local modules sitting next to the original MDX file.
  return code.replace(/from\s+(['"])(\.\.?\/[^'"]+)\1/g, (_, q, specifier) => {
    const abs = pathToFileURL(resolve(inputDir, specifier)).href
    return `from ${q}${abs}${q}`
  })
}

async function loadMdxComponent(mdxJsCode: string, input: string, options: Option) {
  // Write the temp file next to this module (inside core package) so that Node.js
  // can resolve bare imports like "react" via core's node_modules.
  const tempModulePath = join(__dirname, `.temp_mdx_${Date.now()}.mjs`)

  try {
    await writeFile(tempModulePath, mdxJsCode, 'utf-8')
    const module = await import(pathToFileURL(tempModulePath).href)
    return module.default as (props: { components?: Record<string, unknown> }) => ReactElement
  } finally {
    if (!options.filedebug) {
      unlink(tempModulePath).catch((err) => {
        if (err.code !== 'ENOENT') {
          console.error('Failed to delete temp module file:', tempModulePath, err)
        }
      })
    }
  }
}

async function renderMdxToPdf(mdxJsCode: string, input: string, options: Option) {
  const inputFileName = basename(input, extname(input))
  const MDXContent = await loadMdxComponent(mdxJsCode, input, options)
  const outputPath = join(options.outputDir, `${inputFileName}.output.pdf`)

  const fontFamily = options.lang?.includes('zh') ? 'Noto Sans SC' : 'Helvetica'

  const document = (
    <Document>
      <Page size="A4" style={{ padding: 24, gap: 8, fontFamily }}>
        <MDXProvider components={ElementMap}>
          <MDXContent />
        </MDXProvider>
      </Page>
    </Document>
  )

  await renderToFile(document, outputPath)

  return outputPath
}

export interface Option {
  filedebug?: boolean
  outputDir: string
  lang?: string
}
export async function render(input: string, options: Option) {
  const inputFileName = basename(input, extname(input))
  const outdir = options.outputDir
  const content = await readFile(input, 'utf-8')

  const reactContent = await convertMdxToReact(content, dirname(input))

  if (options.filedebug) {
    await writeFile(join(outdir, `${inputFileName}.output.jsx`), reactContent, 'utf-8')
    console.log('Generated JSX at: ', outdir)
  }

  const pdfPath = await renderMdxToPdf(reactContent, input, options)
  console.log('Rendered PDF: ', pdfPath)
}
