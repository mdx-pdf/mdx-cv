import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render as renderMDX } from '@mdx-cv/core'
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
  const inputDir = dirname(options.input)
  options.outputDir = options.output ?? inputDir

  Font.register({
    family: 'Noto Sans SC',
    src: fileURLToPath(new URL('../assets/NotoSansSC-Regular.ttf', import.meta.url)),
  })
  Font.register({
    family: 'Noto Sans SC',
    src: fileURLToPath(new URL('../assets/NotoSansSC-Bold.ttf', import.meta.url)),
    fontWeight: 'bold',
  })

  renderMDX(options.input, options)
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
