import { readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from '@mdx-js/mdx'
import { Command } from 'commander'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main(input: string, output: string) {
  const mdx = await readFile(input, 'utf-8')

  const compiled = await compile(mdx, {
    development: true,
    jsx: true,
  })

  await writeFile(output, String(compiled), 'utf-8')
}

export const mdx2jsx = new Command('mdx2jsx')

mdx2jsx
  .option('-o, --output [path]', 'output path for the generated JSX file')
  .argument('<input>', 'path to the input MDX file')
  .action(async (input, options) => {
    const inputDir = dirname(input)
    const output = options.output ?? join(inputDir, `${basename(input, extname(input))}.jsx`)
    await main(input, output)
  })
