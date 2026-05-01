import { readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import postcss from 'postcss'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const __dirname = dirname(fileURLToPath(import.meta.url))

type Options = {
  output: string
  html?: boolean
  style?: string
}
async function main(input: string, options: Options) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: options.html })
    .use(rehypeStringify, { allowDangerousHtml: options.html })

  const md = await readFile(input, 'utf-8')

  const htmlContent = await processor.process(md)

  let finalHtml = String(htmlContent)

  if (options.style) {
    const css = await readFile(options.style, 'utf-8')
    const finalCss = postcss([
      {
        postcssPlugin: 'em-to-px',
        Declaration(decl) {
          if (decl.value.includes('em')) {
            const baseFontSize = 10
            decl.value = decl.value.replace(/(\d*\.?\d+)em/g, (_, p1) => {
              return `${parseFloat(p1) * baseFontSize}px`
            })
            if (decl.value.includes('rem')) {
              const baseFontSize = 10
              decl.value = decl.value.replace(/(\d*\.?\d+)rem/g, (_, p1) => {
                return `${parseFloat(p1) * baseFontSize}px`
              })
            }
          }
        },
      },
    ]).process(css)
    const styleTag = `<style>${finalCss.css}</style>`
    const htmlWithStyle = `${styleTag}\n${String(htmlContent)}`
    finalHtml = htmlWithStyle
  }

  await writeFile(options.output, finalHtml, 'utf-8')
}

export const md2html = new Command('md2html')

md2html
  .option('-o, --output [path]', 'output path for the generated HTML file')
  .option('--html', 'Support raw HTML in the Markdown input')
  .option('-s, --style [path]', 'path to the CSS file to use for styling the HTML output')
  .argument('<input>', 'path to the input Markdown file')
  .action(async (input, options) => {
    const inputDir = dirname(input)
    options.output = options.output ?? join(inputDir, `${basename(input, extname(input))}.html`)
    await main(input, options)
  })
