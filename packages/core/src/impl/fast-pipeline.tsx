// 这是一个支持从 MDX 生成 PDF 的快速工具链拼装脚本
// 1. Compile MDX to React component
// 2. Render React component to static HTML
// 3. Compose HTML to React-PDF component
// 4. Render React-PDF to PDF file

import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Html from '@hzstudio/react-pdf-html'
import mdx from '@mdx-js/rollup'
import { Document, Font, Page, renderToFile } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { rollup } from 'rollup'
import { cssAsString } from './rollup-plugins/css-as-string.js'
import { mdxCssCollectorPlugin } from './rollup-plugins/mdx-css-collector-plugin.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function isExternalModule(id: string) {
  return id === 'react' || id === 'react/jsx-runtime'
}

async function compileMdxByRollup(filepath: string, outdir: string) {
  const outfile = join(outdir, 'mdx-cv_output.jsx')
  const bundle = await rollup({
    input: filepath,
    plugins: [mdx(), mdxCssCollectorPlugin(), cssAsString()],
    external: isExternalModule,
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
  return module as {
    default: (props: { components?: Record<string, unknown> }) => ReactElement
    createStyleCollector: () => { add(css: string): void; toString(): string }
    StyleProvider: (props: {
      collector: { add(css: string): void }
      children: ReactElement
    }) => ReactElement
  }
}

function createHtmlDocument(htmlFragment: string, options?: Option) {
  const lang = options?.lang || 'zh-CN'
  return `<html lang="${lang}"><body>${htmlFragment}</body></html>`
}

async function renderReactComponentToHtml(
  Component: (props: { components?: Record<string, unknown> }) => ReactElement,
  StyleProvider: (props: {
    collector: { add(css: string): void }
    children: ReactElement
  }) => ReactElement,
  createStyleCollector: () => { add(css: string): void; toString(): string },
  options?: Option,
) {
  const collector = createStyleCollector()
  const bodyHtml = renderToStaticMarkup(
    <StyleProvider collector={collector}>
      <Component />
    </StyleProvider>,
  )
  const collectedCss = collector.toString()
  const htmlFragment = collectedCss ? `<style>${collectedCss}</style>${bodyHtml}` : bodyHtml
  const htmlDocument = createHtmlDocument(htmlFragment, options)
  console.log('Rendered html size: ', htmlDocument.length)
  if (options?.filedebug) {
    await writeFile(join(options.outputDir, 'mdx-cv_output.html'), htmlDocument, 'utf-8')
  }
  return htmlDocument
}

interface RenderConfig {
  assetsDir: string
  outdir: string
}
async function renderHtmlToPdf(html: string, renderConfig: RenderConfig) {
  const assetsDir = renderConfig.assetsDir

  Font.register({
    family: 'Noto Sans SC',
    fonts: [
      { src: join(assetsDir, 'NotoSansSC-Regular.ttf') },
      { src: join(assetsDir, 'NotoSansSC-Bold.ttf'), fontWeight: 'bold' },
    ],
  })

  const outputPath = join(renderConfig.outdir, 'mdx-cv_output.pdf')
  console.log('Rendering PDF to: ', outputPath)
  renderToFile(
    <Document>
      <Page>
        <Html>{html}</Html>
      </Page>
    </Document>,
    outputPath,
  )
}

interface Option {
  filedebug?: boolean
  outputDir: string
  lang?: string
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

  const compiledModule = await loadMdxComponentFromFile(outfilepath)

  const html = await renderReactComponentToHtml(
    compiledModule.default,
    compiledModule.StyleProvider,
    compiledModule.createStyleCollector,
    options,
  )

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
    .option('-l, --lang <lang>', 'language of the document, e.g. "en" or "zh-CN"')
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
