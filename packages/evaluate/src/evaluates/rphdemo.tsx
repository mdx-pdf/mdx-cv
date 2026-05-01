import { readFile } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Html } from '@hzstudio/react-pdf-html'
import ReactPDF, { Document, Page } from '@react-pdf/renderer'
import { Command } from 'commander'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Demo1Props {
  html: string
  resetStyles: boolean
}
function Demo({ html, resetStyles }: Demo1Props) {
  return (
    <Document>
      <Page>
        <Html resetStyles={resetStyles}>{html}</Html>
      </Page>
    </Document>
  )
}

async function main(input: string, output: string, resetStyles: boolean) {
  const html = await readFile(input, 'utf-8')

  await ReactPDF.render(<Demo html={html} resetStyles={resetStyles} />, output)
}

export const rphdemo = new Command('rphdemo')

rphdemo
  .option('-o, --output [path]', 'output path for the generated PDF file')
  .option('-r, --reset-styles', 'reset styles in Html component')
  .argument('<input>', 'path to the input HTML file')
  .action(async (input, options) => {
    const inputDir = dirname(input)
    const output = options.output ?? join(inputDir, `${basename(input, extname(input))}.pdf`)
    await main(input, output, options.resetStyles)
  })
