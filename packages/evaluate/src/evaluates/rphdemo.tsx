import { readFile } from 'node:fs/promises'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ReactPDF, { Document, Page } from '@react-pdf/renderer'
import { Command } from 'commander'
import { Html } from 'react-pdf-html'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Demo1Props {
  html: string
}
function Demo({ html }: Demo1Props) {
  return (
    <Document>
      <Page>
        <Html resetStyles={false}>{html}</Html>
      </Page>
    </Document>
  )
}

async function main(input: string, output: string) {
  const html = await readFile(input, 'utf-8')

  await ReactPDF.render(<Demo html={html} />, output)
}

export const rphdemo = new Command('rphdemo')

rphdemo
  .option('-o, --output [path]', 'output path for the generated PDF file')
  .argument('<input>', 'path to the input HTML file')
  .action(async (input, options) => {
    const inputDir = dirname(input)
    const output = options.output ?? join(inputDir, `${basename(input, extname(input))}.pdf`)
    await main(input, output)
  })
