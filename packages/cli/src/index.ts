#!/usr/bin/env node
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { main } from '@mdx-cv/core/render'
import { Font } from '@react-pdf/renderer'
import { Command, program } from 'commander'

Font.register({
  family: 'Noto Sans SC',
  src: fileURLToPath(new URL('../assets/NotoSansSC-Regular.ttf', import.meta.url)),
})
Font.register({
  family: 'Noto Sans SC',
  src: fileURLToPath(new URL('../assets/NotoSansSC-Bold.ttf', import.meta.url)),
  fontWeight: 'bold',
})

program
  .name('mdx-cv')
  .description('A CLI tool for generating PDF resumes from MDX files.')
  .version('0.0.0')

program
  .command('init')
  .description('Initialize a new MDX CV project.')
  .action(() => {
    console.log('Initializing a new MDX CV project...')
  })

const render = new Command('render')

render
  .option('-f, --filedebug', 'output intermediate files for debugging')
  .option(
    '-o, --output <output>',
    'path to the output file, if not specified, output to the same directory as input',
  )
  .option('-l, --lang <lang>', 'language of the document, e.g. "en" or "zh-CN"')
  .argument('<input>', 'path to the input MDX file')
  .action(async (input, options) => {
    const inputDir = dirname(input)
    options.outputDir = options.output ?? inputDir

    await main(input, options)
  })

program.addCommand(render)

await program.parseAsync()
