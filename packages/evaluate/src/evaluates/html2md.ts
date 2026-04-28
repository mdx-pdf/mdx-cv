import { readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import TurndownService from 'turndown'

const __dirname = dirname(fileURLToPath(import.meta.url))

const turndownService = new TurndownService()

async function main(input: string, output: string) {
  const html = await readFile(input, 'utf-8')

  const md = turndownService.turndown(html)

  await writeFile(output, md, 'utf-8')
}

export const html2md = new Command('html2md')

html2md
  .option('-o, --output [path]', 'output path for the generated Markdown file')
  .argument('<input>', 'path to the input HTML file')
  .action(async (input, options) => {
    const inputDir = dirname(input)
    const output = options.output ?? join(inputDir, `${basename(input, extname(input))}.md`)
    await main(input, output)
  })
