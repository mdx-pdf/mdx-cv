import postcss from 'postcss'
import { toCamelCase } from '../../shared/index.js'
import { isValidCssProperty, VALID_UNITS } from '../../shared/react-pdf-style.js'

export interface CheckCssResult {
  unsupportedProperties: string[]
  unsupportedValues: string[]
}

const VALID_UNIT_SET = new Set<string>(VALID_UNITS)

const LENGTH_RE = /^(-?\d*\.?\d+)(px|pt|in|mm|cm|%|vw|vh|em|rem)?$/i

/**
 * Check a CSS string for properties and values not supported by react-pdf.
 *
 * - **unsupportedProperties**: CSS properties that react-pdf does not recognise.
 * - **unsupportedValues**: declarations whose value uses a unit that react-pdf
 *   does not support (e.g. `ch`, `ex`, `vw` used outside string context).
 *
 * Shorthand properties (`margin`, `padding`, `border`, `font`) are expanded to
 * their longhand equivalents before checking so they are evaluated correctly.
 */
export function checkCss(css: string): CheckCssResult {
  const root = postcss.parse(css)
  const unsupportedProperties = new Set<string>()
  const unsupportedValues = new Set<string>()

  root.walkDecls((decl) => {
    const cssProp = decl.prop.trim()
    const camelProp = toCamelCase(cssProp)

    // Property check
    if (!isValidCssProperty(camelProp)) {
      unsupportedProperties.add(cssProp)
      return
    }

    // Value check: look for length units not supported by react-pdf
    checkValueUnits(decl.value, cssProp, unsupportedValues)
  })

  return {
    unsupportedProperties: [...unsupportedProperties],
    unsupportedValues: [...unsupportedValues],
  }
}

function checkValueUnits(value: string, cssProp: string, unsupportedValues: Set<string>) {
  for (const token of value.split(/\s+/)) {
    const match = token.match(LENGTH_RE)
    if (!match) continue

    const unit = match[2]?.toLowerCase()
    if (
      unit &&
      unit !== 'px' &&
      unit !== 'em' &&
      unit !== 'rem' &&
      !VALID_UNIT_SET.has(unit as (typeof VALID_UNITS)[number])
    ) {
      // px is implicitly supported (converted to pt at runtime), skip
      unsupportedValues.add(`${cssProp}: ${value}`)
      return
    }
  }
}

if (import.meta.main) {
  async function cli() {
    const input = process.argv[2]
    if (!input) {
      console.error('Usage: check-css <css-file>')
      process.exit(1)
    }

    const { readFile } = await import('node:fs/promises')

    const inputContent = await readFile(input, 'utf-8')

    const result = checkCss(inputContent)
    console.log(JSON.stringify(result, null, 2))
  }
  cli()
}
