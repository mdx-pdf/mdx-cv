import postcss from 'postcss'
import { toCamelCase } from '../../shared/index.js'
import { isValidCssProperty, VALID_UNITS } from '../../shared/react-pdf-style.js'

export interface CheckCssResult {
  unsupportedProperties: string[]
  unsupportedValues: string[]
}

const VALID_UNIT_SET = new Set<string>(VALID_UNITS)

const LENGTH_RE = /^(-?\d*\.?\d+)(px|pt|in|mm|cm|%|vw|vh|em|rem)?$/i
const COLOR_RE = /^(#([0-9a-f]{3,8})|rgba?\(|hsla?\(|transparent|currentColor)$/i

/**
 * Valid keyword values for CSS properties in react-pdf.
 * Properties not listed here accept any value (colors, lengths, numbers, etc.).
 */
const KEYWORD_VALUES: Record<string, Set<string>> = {
  display: new Set(['flex', 'none']),
  position: new Set(['relative', 'absolute', 'static']),
  overflow: new Set(['hidden', 'visible', 'scroll']),
  flexDirection: new Set(['row', 'column', 'row-reverse', 'column-reverse']),
  flexWrap: new Set(['nowrap', 'wrap', 'wrap-reverse']),
  justifyContent: new Set([
    'flex-start',
    'flex-end',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
  ]),
  alignItems: new Set(['flex-start', 'flex-end', 'center', 'stretch', 'baseline']),
  alignContent: new Set([
    'flex-start',
    'flex-end',
    'center',
    'stretch',
    'space-between',
    'space-around',
    'space-evenly',
  ]),
  alignSelf: new Set(['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch']),
  textAlign: new Set(['left', 'right', 'center', 'justify']),
  fontStyle: new Set(['normal', 'italic', 'oblique']),
  fontWeight: new Set([
    'normal',
    'bold',
    'bolder',
    'lighter',
    'thin',
    'hairline',
    'ultralight',
    'extralight',
    'light',
    'medium',
    'semibold',
    'demibold',
    'ultrabold',
    'extrabold',
    'heavy',
    'black',
  ]),
  textDecoration: new Set(['none', 'underline', 'line-through', 'underline line-through', 'line-through underline']),
  textTransform: new Set(['capitalize', 'lowercase', 'uppercase', 'upperfirst', 'none']),
  verticalAlign: new Set(['sub', 'super']),
  borderStyle: new Set(['solid', 'dashed', 'dotted']),
  textDecorationStyle: new Set(['solid', 'double', 'dotted', 'dashed', 'wavy']),
  direction: new Set(['ltr', 'rtl']),
  objectFit: new Set(['contain', 'cover', 'stretch', 'none', 'scale-down']),
}

/**
 * Properties that accept any value — skip value validation entirely.
 * These typically accept colors, arbitrary strings, or complex values.
 */
const SKIP_VALUE_CHECK = new Set([
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'textDecorationColor',
  'fontFamily',
])

/**
 * Check a CSS string for properties and values not supported by react-pdf.
 *
 * - **unsupportedProperties**: CSS properties that react-pdf does not recognise.
 * - **unsupportedValues**: full `property: value` pairs whose value is not
 *   supported — this includes unsupported units, invalid keywords, etc.
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

    // Value check
    checkValue(cssProp, camelProp, decl.value.trim(), unsupportedValues)
  })

  return {
    unsupportedProperties: [...unsupportedProperties],
    unsupportedValues: [...unsupportedValues],
  }
}

function checkValue(
  cssProp: string,
  camelProp: string,
  value: string,
  unsupportedValues: Set<string>,
) {
  if (SKIP_VALUE_CHECK.has(camelProp)) return

  // Keyword-restricted properties
  const allowedKeywords = KEYWORD_VALUES[camelProp]
  if (allowedKeywords) {
    // Check if the full value matches a known keyword
    const normalizedValue = value.toLowerCase()
    if (allowedKeywords.has(normalizedValue)) return

    // Multi-token values: check each token individually (e.g. border: 1px solid red)
    const tokens = value.split(/\s+/)
    const allTokensValid = tokens.every((token) => {
      const lower = token.toLowerCase()
      return (
        allowedKeywords.has(lower) ||
        LENGTH_RE.test(token) ||
        COLOR_RE.test(token) ||
        /^inherit|initial|unset|revert|auto|none|normal$/.test(lower)
      )
    })

    if (!allTokensValid && !allowedKeywords.has(normalizedValue)) {
      unsupportedValues.add(`${cssProp}: ${value}`)
    }
    return
  }

  // Non-keyword properties: check for unsupported units
  checkValueUnits(cssProp, value, unsupportedValues)
}

function checkValueUnits(cssProp: string, value: string, unsupportedValues: Set<string>) {
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
