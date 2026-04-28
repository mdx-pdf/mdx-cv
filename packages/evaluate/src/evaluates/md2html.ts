import { readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main(input: string, output: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify)

  const md = await readFile(input, 'utf-8')

  const file = await processor.process(md)

  await writeFile(output, String(file), 'utf-8')
}

export const md2html = new Command('md2html')

md2html
  .option('-o, --output [path]', 'output path for the generated HTML file')
  .argument('<input>', 'path to the input Markdown file')
  .action(async (input, options) => {
    const inputDir = dirname(input)
    const output = options.output ?? join(inputDir, `${basename(input, extname(input))}.html`)
    await main(input, output)
  })
