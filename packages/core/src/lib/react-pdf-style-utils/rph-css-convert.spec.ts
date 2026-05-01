import { describe, expect, it } from 'vitest'
import { convertCssToRphCss } from './rph-css-convert.js'

describe('convertCssToRphCss', () => {
  it('preserves react-pdf-html HtmlStyle properties', () => {
    const input = `
.table {
  list-style: square;
  list-style-type: lower-roman;
  border-spacing: 4px;
  border-collapse: collapse;
}
`

    const result = convertCssToRphCss(input)

    expect(result.css).toContain('list-style: square;')
    expect(result.css).toContain('list-style-type: lower-roman;')
    expect(result.css).toContain('border-spacing: 4px;')
    expect(result.css).toContain('border-collapse: collapse;')
    expect(result.warnings).toEqual([])
  })
})
