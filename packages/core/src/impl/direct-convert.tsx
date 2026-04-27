/** WIP: Direct Convert MDX to React-PDF Tree, then output PDF */
import fs from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { compile } from '@mdx-js/mdx'
import { MDXProvider } from '@mdx-js/react'
import { Document, Font, Page, renderToFile } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

import { ReactPDFComponentMap as MdElementMap } from '../lib/MdElementMap.js'

Font.register({
  family: 'Noto Sans SC',
  src: fileURLToPath(new URL('./assets/NotoSansSC-Regular.ttf', import.meta.url)),
})

async function convertMdxToReact(mdxContent: string) {
  const result = await compile(mdxContent, {
    providerImportSource: '@mdx-js/react',
    // jsx: true,
  })
  return String(result).replaceAll('"\\n"', 'null')
}

async function loadMdxComponent(mdxJsCode: string, inputPath: string) {
  const tempModulePath = path.join(path.dirname(inputPath), `.temp_mdx_${Date.now()}.mjs`)

  try {
    await writeFile(tempModulePath, mdxJsCode, 'utf-8')
    const module = await import(pathToFileURL(tempModulePath).href)
    return module.default as (props: { components?: Record<string, unknown> }) => ReactElement
  } finally {
    if (fs.existsSync(tempModulePath)) {
      fs.unlinkSync(tempModulePath)
    }
  }
}

async function renderMdxToPdf(mdxJsCode: string, inputPath: string) {
  const MDXContent = await loadMdxComponent(mdxJsCode, inputPath)
  const outputPath = path.join(path.dirname(inputPath), 'output.pdf')

  const document = (
    <Document>
      <Page size="A4" style={{ padding: 24, gap: 8, fontFamily: 'Noto Sans SC' }}>
        <MDXProvider components={MdElementMap}>
          <MDXContent />
        </MDXProvider>
      </Page>
    </Document>
  )

  await renderToFile(document, outputPath)

  return outputPath
}

async function main(inputPath: string) {
  const content = await readFile(inputPath, 'utf-8')

  const reactContent = await convertMdxToReact(content)
  const jsxOutputDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../output')
  await writeFile(path.join(jsxOutputDir, 'output.jsx'), reactContent, 'utf-8')
  console.log('Generated JSX at: ', jsxOutputDir)

  const pdfPath = await renderMdxToPdf(reactContent, inputPath)
  console.log('Rendered PDF: ', pdfPath)
}

if (import.meta.main) {
  const input = process.argv[2]

  if (input) {
    const inputpath = path.resolve(process.cwd(), input)
    console.log('Run with input: ', inputpath)

    await main(inputpath)
  } else {
    console.log('Run without input.')
  }
}
