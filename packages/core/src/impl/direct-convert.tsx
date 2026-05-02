/** WIP: Direct Convert MDX to React-PDF Tree, then output PDF */
/* @jsxRuntime automatic */
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { compile } from '@mdx-js/mdx'
import { MDXProvider } from '@mdx-js/react'
import { Document, Page, renderToFile } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

import { ElementMap } from '../elements/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function convertMdxToReact(mdxContent: string) {
  const result = await compile(mdxContent, {
    providerImportSource: '@mdx-js/react',
  })
  return String(result).replaceAll('"\\n"', 'null')
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

  const document = (
    <Document>
      <Page size="A4" style={{ padding: 24, gap: 8, fontFamily: 'Noto Sans SC' }}>
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
export async function main(input: string, options: Option) {
  const inputFileName = basename(input, extname(input))
  const content = await readFile(input, 'utf-8')

  const reactContent = await convertMdxToReact(content)

  if (options.filedebug) {
    await writeFile(join(options.outputDir, `${inputFileName}.output.jsx`), reactContent, 'utf-8')
    console.log('Generated JSX at: ', options.outputDir)
  }

  const pdfPath = await renderMdxToPdf(reactContent, input, options)
  console.log('Rendered PDF: ', pdfPath)
}
