// 这是一个支持从 MDX 生成 PDF 的快速工具链拼装脚本
// 1. Compile MDX to React component
// 2. Render React component to static HTML
// 3. Compose HTML to React-PDF component
// 4. Render React-PDF to PDF file

import { writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import mdx from '@mdx-js/esbuild'
import { Document, Font, Page, renderToFile } from '@react-pdf/renderer'
import esbuild from 'esbuild'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Html, { type HtmlStyles } from 'react-pdf-html'

async function compileMdxByESBuild(filepath: string, outdir: string) {
  const outfile = join(outdir, 'mdx-cv_output.jsx')
  await esbuild.build({
    entryPoints: [filepath],
    bundle: true,
    format: 'esm',
    outfile: outfile,
    plugins: [mdx()],
    external: ['react/jsx-runtime'],
  })
  return outfile
}

async function loadMdxComponentFromFile(filepath: string) {
  const module = await import(pathToFileURL(filepath).href)
  return module.default as (props: { components?: Record<string, unknown> }) => ReactElement
}

async function renderReactComponentToHtml(
  Component: (props: { components?: Record<string, unknown> }) => ReactElement,
) {
  return renderToStaticMarkup(<Component />)
}

interface RenderConfig {
  styleSheet: HtmlStyles
}
async function renderHtmlToPdf(html: string, outputPath: string, renderConfig?: RenderConfig) {
  const fontDir = join(dirname(fileURLToPath(import.meta.url)), '../../src/assets')
  Font.register({
    family: 'Noto Sans SC',
    fonts: [
      { src: join(fontDir, 'NotoSansSC-Regular.ttf') },
      { src: join(fontDir, 'NotoSansSC-Bold.ttf'), fontWeight: 'bold' },
    ],
  })

  const stylesheet: HtmlStyles = renderConfig?.styleSheet ?? {
    '*': { fontFamily: 'Noto Sans SC', fontSize: 12, lineHeight: 1.5 },
  }
  renderToFile(
    <Document>
      <Page style={{ fontFamily: 'Noto Sans SC' }}>
        <Html resetStyles stylesheet={stylesheet}>
          {html}
        </Html>
      </Page>
    </Document>,
    outputPath,
  )
}

interface Config {
  filedebug?: boolean
  renderConfig?: RenderConfig
}
export async function main(inputPath: string, config: Config = {}) {
  const ouputDir = join(dirname(fileURLToPath(import.meta.url)), '../../output')

  const outfilepath = await compileMdxByESBuild(inputPath, ouputDir)

  const MDXComponent = await loadMdxComponentFromFile(outfilepath)

  const html = await renderReactComponentToHtml(MDXComponent)
  console.log('Rendered html: ', html.length)

  if (config.filedebug) {
    await writeFile(join(ouputDir, 'mdx-cv_output.html'), html, 'utf-8')
  }

  await renderHtmlToPdf(html, join(ouputDir, 'mdx-cv_output.pdf'))
  console.log('Rendered PDF: ', join(ouputDir, 'mdx-cv_output.pdf'))
}

if (import.meta.main) {
  const input = process.argv[2]

  if (input) {
    const inputpath = resolve(process.cwd(), input)
    console.log('Run with input: ', inputpath)

    await main(inputpath)
  } else {
    console.log('Run without input.')
  }
}
