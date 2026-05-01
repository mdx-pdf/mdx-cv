/** WIP: Direct Convert MDX to React-PDF Tree, then output PDF */
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { compile } from '@mdx-js/mdx'
import { MDXProvider } from '@mdx-js/react'
import { Document, Font, Page, renderToFile } from '@react-pdf/renderer'
import { Command } from 'commander'
import type { ReactElement } from 'react'

import { ElementMap } from '../elements/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

Font.register({
  family: 'Noto Sans SC',
  src: fileURLToPath(new URL('../../assets/input/NotoSansSC-Regular.ttf', import.meta.url)),
})

async function convertMdxToReact(mdxContent: string) {
  const result = await compile(mdxContent, {
    providerImportSource: '@mdx-js/react',
  })
  return String(result).replaceAll('"\\n"', 'null')
}

async function loadMdxComponent(mdxJsCode: string, inputPath: string) {
  const tempModulePath = join(dirname(inputPath), `.temp_mdx_${Date.now()}.mjs`)

  try {
    await writeFile(tempModulePath, mdxJsCode, 'utf-8')
    const module = await import(pathToFileURL(tempModulePath).href)
    return module.default as (props: { components?: Record<string, unknown> }) => ReactElement
  } finally {
    unlink(tempModulePath).catch((err) => {
      if (err.code !== 'ENOENT') {
        console.error('Failed to delete temp module file:', tempModulePath, err)
      }
    })
  }
}

async function renderMdxToPdf(mdxJsCode: string, inputPath: string, options: Option) {
  const MDXContent = await loadMdxComponent(mdxJsCode, inputPath)
  const outputPath = join(options.outputDir, 'output.pdf')

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

interface Option {
  filedebug?: boolean
  outputDir: string
  lang?: string
  resetCss?: boolean
}
async function main(input: string, options: Option) {
  const content = await readFile(input, 'utf-8')

  const reactContent = await convertMdxToReact(content)

  await writeFile(join(options.outputDir, 'output.jsx'), reactContent, 'utf-8')
  console.log('Generated JSX at: ', options.outputDir)

  const pdfPath = await renderMdxToPdf(reactContent, input, options)
  console.log('Rendered PDF: ', pdfPath)
}

export const render = new Command('render')

render
  .option('-f, --filedebug', 'output intermediate files for debugging')
  .option('-o, --output <output>', 'path to the output file')
  .option('-l, --lang <lang>', 'language of the document, e.g. "en" or "zh-CN"')
  .argument('<input>', 'path to the input MDX file')
  .action(async (input, options) => {
    const inputDir = dirname(input)
    options.outputDir = options.output ?? inputDir

    await main(input, options)
  })
