import postcss from 'postcss'
import { toCamelCase } from '../../shared/index.js'
import { checkCss } from './check-css.js'

export interface RphStyleConvertOptions {
  /** Base font size in pt, used for em→pt conversion. Default: 10 */
  baseFontSize?: number
}

export interface RphStyleConvertResult {
  /** Converted CSS string (kebab-case properties, values compatible with react-pdf) */
  css: string
  /** Warnings for skipped properties and converted units */
  warnings: string[]
}

const LENGTH_RE = /^(-?\d*\.?\d+)(px|pt|in|mm|cm|%|vw|vh|em|rem)?$/i

/**
 * Convert a CSS stylesheet to react-pdf-html compatible CSS.
 *
 * The output is a CSS string with kebab-case properties, where values are
 * adjusted to be compatible with react-pdf's style engine:
 *
 * - Unsupported properties are removed with a warning.
 * - `em` / `rem` values are converted to `pt` using `baseFontSize`.
 * - `px` and other react-pdf-supported units are kept as-is.
 * - Other unsupported units produce a warning and the value is kept as-is.
 */
export function convertCssToRphCss(
  css: string,
  options: RphStyleConvertOptions = {},
): RphStyleConvertResult {
  const baseFontSize = options.baseFontSize ?? 10
  const warnings: string[] = []

  const checkResult = checkCss(css)
  const unsupportedPropSet = new Set(checkResult.unsupportedProperties)
  const unsupportedValueSet = new Set(checkResult.unsupportedValues)

  for (const prop of checkResult.unsupportedProperties) {
    warnings.push(`Skipped unsupported property: "${prop}"`)
  }
  for (const val of checkResult.unsupportedValues) {
    warnings.push(`Skipped unsupported value: "${val}"`)
  }

  const root = postcss.parse(css)

  root.walkDecls((decl) => {
    const cssProp = decl.prop.trim()
    const camelProp = toCamelCase(cssProp)

    if (unsupportedPropSet.has(cssProp)) {
      decl.remove()
      return
    }

    // Skip declarations whose value was flagged as unsupported
    const declKey = `${cssProp}: ${decl.value.trim()}`
    if (unsupportedValueSet.has(declKey)) {
      decl.remove()
      return
    }

    // font-size with % causes NaN in react-pdf-html (no inherited context)
    if (camelProp === 'fontSize' && /^\d+%$/.test(decl.value.trim())) {
      const pct = Number.parseFloat(decl.value.trim())
      decl.value = `${round((pct / 100) * baseFontSize)}pt`
    }

    decl.value = convertValue(camelProp, decl.value.trim(), baseFontSize, warnings)
  })

  // Clean up empty rules left after removing declarations
  root.walkRules((rule) => {
    if (rule.nodes && rule.nodes.length === 0) {
      rule.remove()
    }
  })

  return { css: root.toString(), warnings }
}

function convertValue(
  property: string,
  value: string,
  baseFontSize: number,
  warnings: string[],
): string {
  const tokens = value.split(/\s+/)
  if (tokens.length > 1) {
    return tokens.map((t) => convertToken(property, t, baseFontSize, warnings)).join(' ')
  }
  return String(convertToken(property, tokens[0]!, baseFontSize, warnings))
}

function convertToken(
  property: string,
  token: string,
  baseFontSize: number,
  warnings: string[],
): string {
  const match = token.match(LENGTH_RE)
  if (!match) return token

  const numericValue = Number(match[1])
  const unit = match[2]?.toLowerCase()

  switch (unit) {
    case undefined:
    case 'pt':
    case 'px':
      return token
    case 'em':
      return `${round(numericValue * baseFontSize)}pt`
    case 'rem':
      return `${round(numericValue * baseFontSize)}pt`
    case '%':
    case 'vw':
    case 'vh':
    case 'in':
    case 'mm':
    case 'cm':
      return token
    default:
      warnings.push(`Unsupported unit "${unit}" in "${property}: ${token}"`)
      return token
  }
}

function round(value: number): number {
  return Number(value.toFixed(4))
}

if (import.meta.main) {
  async function cli() {
    const input = process.argv[2]
    if (!input) {
      console.error('Usage: rph-style-convert <css-file>')
      process.exit(1)
    }

    const { readFile } = await import('node:fs/promises')

    const inputContent = await readFile(input, 'utf-8')

    const result = convertCssToRphCss(inputContent)
    console.log('=== Warnings ===')
    /* biome-ignore lint/suspicious/useIterableCallbackReturn: just log */
    result.warnings.forEach((w) => console.log(w))
  }
  cli()
}
