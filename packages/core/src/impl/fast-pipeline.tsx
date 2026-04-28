// 这是一个支持从 MDX 生成 PDF 的快速工具链拼装脚本
// 1. Compile MDX to React component
// 2. Render React component to static HTML
// 3. Compose HTML to React-PDF component
// 4. Render React-PDF to PDF file

import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import mdx from '@mdx-js/rollup'
import { Document, Font, Page, renderToFile } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Html, { type HtmlStyles } from 'react-pdf-html'
import { rollup } from 'rollup'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function compileMdxByRollup(filepath: string, outdir: string) {
  const outfile = join(outdir, 'mdx-cv_output.jsx')
  const bundle = await rollup({
    input: filepath,
    plugins: [mdx()],
    external: ['react/jsx-runtime'],
  })

  await bundle.write({
    file: outfile,
    format: 'esm',
  })

  await bundle.close()
  return outfile
}

async function loadMdxComponentFromFile(filepath: string) {
  const module = await import(pathToFileURL(filepath).href)
  return module.default as (props: { components?: Record<string, unknown> }) => ReactElement
}

async function renderReactComponentToHtml(
  Component: (props: { components?: Record<string, unknown> }) => ReactElement,
  options?: Option,
) {
  const html = renderToStaticMarkup(<Component />)
  console.log('Rendered html size: ', html.length)
  if (options?.filedebug) {
    await writeFile(join(options.outputDir, 'mdx-cv_output.html'), html, 'utf-8')
  }
  return html
}

interface RenderConfig {
  assetsDir: string
  outdir: string
  styleSheet?: HtmlStyles
}
async function renderHtmlToPdf(html: string, renderConfig: RenderConfig) {
  const assetsDir = renderConfig.assetsDir
  // const style = await readFile(join(renderConfig.assetsDir, 'resume', 'style.css'), 'utf-8')
  // const result = convertCssToReactPdfStylesheet(style, {
  //   mode: 'loose',
  //   baseFontSize: 12,
  // })

  // await writeFile(
  //   join(__dirname, '..', '..', 'assets', 'output', 'css-to-react-pdf-result.json'),
  //   JSON.stringify(result.styles, null, 2),
  //   'utf-8',
  // )

  Font.register({
    family: 'Noto Sans SC',
    fonts: [
      { src: join(assetsDir, 'NotoSansSC-Regular.ttf') },
      { src: join(assetsDir, 'NotoSansSC-Bold.ttf'), fontWeight: 'bold' },
    ],
  })

  const stylesheet: HtmlStyles = renderConfig?.styleSheet ?? {
    '*': { fontFamily: 'Noto Sans SC', fontSize: 12, lineHeight: 1.5 },
  }
  const finalHtml = `<html><body>${html}</body></html>`
  const outputPath = join(renderConfig.outdir, 'mdx-cv_output.pdf')
  console.log('Rendering PDF to: ', outputPath)
  renderToFile(
    <Document>
      <Page style={{ fontFamily: 'Noto Sans SC' }}>
        <Html stylesheet={stylesheet}>{finalHtml}</Html>
      </Page>
    </Document>,
    outputPath,
  )
}

interface Option {
  filedebug?: boolean
  outputDir: string
  renderConfig?: RenderConfig
}
export async function main(input: string, options: Option) {
  if (!options.outputDir) {
    return console.error(
      'Output directory is required. Please provide it via --output option or place the input file in an "assets/input" directory.',
    )
  }

  const ouputDir = options.outputDir

  const outfilepath = await compileMdxByRollup(input, ouputDir)

  const MDXComponent = await loadMdxComponentFromFile(outfilepath)

  const html = await renderReactComponentToHtml(MDXComponent)

  await renderHtmlToPdf(html, {
    assetsDir: join(__dirname, '../../assets/input'),
    outdir: ouputDir,
    ...options.renderConfig,
  })
}

if (import.meta.main) {
  const { program } = await import('commander')

  program
    .option('-f, --filedebug', 'output intermediate files for debugging')
    .option('-o, --output <output>', 'path to the output file')
    .argument('<input>', 'path to the input MDX file')
    .action(async (input, options) => {
      const inputDir = dirname(input)
      options.outputDir =
        options.output ??
        (inputDir.includes(join('assets', 'input'))
          ? join(__dirname, '..', '..', 'assets', 'output')
          : inputDir)

      await main(input, options)
    })
    .parseAsync()
}
