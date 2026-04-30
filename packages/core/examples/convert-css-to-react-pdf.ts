import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { convertCssToReactPdfStylesheet } from '../src/lib/css-to-react-pdf.js'

const rootDir = dirname(fileURLToPath(import.meta.url))
const css = await readFile(join(rootDir, '../src/assets/resume/style.css'), 'utf-8')

const result = convertCssToReactPdfStylesheet(css, {
  mode: 'loose',
  baseFontSize: 12,
})

console.log(
  JSON.stringify(
    {
      selectorCount: Object.keys(result.styles).length,
      warningCount: result.warnings.length,
      warnings: result.warnings,
      styles: result.styles,
    },
    null,
    2,
  ),
)
