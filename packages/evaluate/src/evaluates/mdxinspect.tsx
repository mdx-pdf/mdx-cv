import { writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Command } from 'commander'
import { renderToStaticMarkup } from 'react-dom/server'

async function main(input: string, output: string) {
  const resolvedPath = resolve(input)
  const mod = await import(pathToFileURL(resolvedPath).href)
  const MDXComponent = (mod.default ?? mod) as React.ComponentType

  const html = renderToStaticMarkup(<MDXComponent />)

  await writeFile(output, html, 'utf-8')
}

export const mdxinspect = new Command('mdxinspect')

mdxinspect
  .option('-o, --output [path]', 'output path for the generated HTML file')
  .argument('<input>', 'path to the input JSX file')
  .action(async (input, options) => {
    const inputDir = dirname(input)
    const output = options.output ?? join(inputDir, `${basename(input, extname(input))}.html`)
    await main(input, output)
  })
