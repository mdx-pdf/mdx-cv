import { createWriteStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { basicRenderer as renderMDX } from '@mdx-cv/core'
import { Font } from '@react-pdf/renderer'
import { Command } from 'commander'

interface Option {
  filedebug?: boolean
  output?: string
  outputDir: string
  lang?: string
  input: string
}
async function main(options: Option) {
  Font.register({
    family: 'Noto Sans SC',
    src: fileURLToPath(new URL('../assets/NotoSansSC-Regular.ttf', import.meta.url)),
  })
  Font.register({
    family: 'Noto Sans SC',
    src: fileURLToPath(new URL('../assets/NotoSansSC-Bold.ttf', import.meta.url)),
    fontWeight: 'bold',
  })

  const absInput = resolve(options.input)
  const outputDir = options.output ?? dirname(absInput)
  const inputFileName = basename(absInput, extname(absInput))
  const outputPath = join(outputDir, `${inputFileName}.output.pdf`)

  const mdxContent = await readFile(absInput, 'utf-8')
  const baseUrl = pathToFileURL(absInput)

  const pdfStream = await renderMDX(mdxContent, baseUrl, options)

  const out = createWriteStream(outputPath)
  pdfStream.pipe(out)
  await new Promise<void>((resolve, reject) => {
    out.on('finish', resolve)
    out.on('error', reject)
  })

  console.log('Rendered PDF:', outputPath)
}

export const render = new Command('render')

render
  .option('-f, --filedebug', 'output intermediate files for debugging')
  .option(
    '-o, --output <output>',
    'path to the output file, if not specified, output to the same directory as input',
  )
  .option('-l, --lang <lang>', 'language of the document, e.g. "en" or "zh-CN"')
  .argument('<input>', 'path to the input MDX file')
  .action((input, options) => {
    main({ ...options, input }).catch((err) => {
      console.error('Error:', err)
      process.exit(1)
    })
  })
