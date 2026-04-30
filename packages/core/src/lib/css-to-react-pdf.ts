import type { HtmlStyles } from '@hzstudio/react-pdf-html'
import postcss, { type AtRule, type Declaration, type Root, type Rule } from 'postcss'

export type CssToReactPdfMode = 'strict' | 'loose'

export interface CssToReactPdfOptions {
  mode?: CssToReactPdfMode
  baseFontSize?: number
}

export interface CssToReactPdfResult {
  styles: HtmlStyles
  warnings: string[]
}

export class CssToReactPdfError extends Error {
  readonly issues: string[]

  constructor(message: string, issues: string[]) {
    super(message)
    this.name = 'CssToReactPdfError'
    this.issues = issues
  }
}

type ReactPdfStyle = Record<string, unknown>

interface DeclarationContext {
  baseFontSize: number
  currentFontSize: number
}

const SUPPORTED_PROPERTIES = new Set([
  'alignContent',
  'alignItems',
  'alignSelf',
  'aspectRatio',
  'backgroundColor',
  'border',
  'borderBottom',
  'borderBottomColor',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStyle',
  'borderBottomWidth',
  'borderColor',
  'borderLeft',
  'borderLeftColor',
  'borderLeftStyle',
  'borderLeftWidth',
  'borderRadius',
  'borderRight',
  'borderRightColor',
  'borderRightStyle',
  'borderRightWidth',
  'borderStyle',
  'borderTop',
  'borderTopColor',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStyle',
  'borderTopWidth',
  'borderWidth',
  'bottom',
  'color',
  'columnGap',
  'direction',
  'display',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexFlow',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'gap',
  'height',
  'justifyContent',
  'left',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxLines',
  'maxWidth',
  'minHeight',
  'minWidth',
  'objectFit',
  'objectPosition',
  'opacity',
  'overflow',
  'padding',
  'paddingBottom',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingVertical',
  'position',
  'right',
  'rowGap',
  'textAlign',
  'textDecoration',
  'textDecorationColor',
  'textDecorationStyle',
  'textIndent',
  'textOverflow',
  'textTransform',
  'top',
  'transform',
  'transformOrigin',
  'verticalAlign',
  'width',
  'zIndex',
])

const LENGTH_PROPERTIES = new Set([
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderRadius',
  'borderRightWidth',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopWidth',
  'borderWidth',
  'bottom',
  'columnGap',
  'fontSize',
  'gap',
  'height',
  'left',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'right',
  'rowGap',
  'textIndent',
  'top',
  'width',
])

const SIMPLE_SELECTOR = /^(\*|[a-z][\w-]*|\.[_a-zA-Z][\w-]*|#[_a-zA-Z][\w-]*)$/i
const LENGTH_VALUE = /^(-?\d*\.?\d+)(px|pt|in|mm|cm|%|vw|vh|em|rem)?$/i
const NUMBER_VALUE = /^-?\d*\.?\d+$/
const FONT_SIZE_VALUE =
  /(-?\d*\.?\d+(?:px|pt|in|mm|cm|%|vw|vh|em|rem)?)(?:\s*\/\s*(-?\d*\.?\d+(?:px|pt|in|mm|cm|%|vw|vh|em|rem)?))?/

const BORDER_STYLES = new Set(['solid', 'dashed', 'dotted'])
const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
])

const MEDIA_QUERY_PREFIX = '@media '
const PX_TO_PT = 0.75

export function convertCssToReactPdfStylesheet(
  css: string,
  options: CssToReactPdfOptions = {},
): CssToReactPdfResult {
  const mode = options.mode ?? 'loose'
  const baseFontSize = options.baseFontSize ?? 12
  const issues: string[] = []
  const styles: HtmlStyles = {}
  const root = postcss.parse(css)

  walkNodes(root, {
    baseFontSize,
    styles,
    issues,
  })

  if (mode === 'strict' && issues.length > 0) {
    throw new CssToReactPdfError('Unsupported CSS found while converting stylesheet.', issues)
  }

  return {
    styles,
    warnings: issues,
  }
}

function walkNodes(
  root: Root | AtRule,
  state: {
    baseFontSize: number
    styles: HtmlStyles
    issues: string[]
  },
  mediaQuery?: string,
) {
  root.each((node) => {
    if (node.type === 'comment') {
      return
    }

    if (node.type === 'rule') {
      applyRule(node, state, mediaQuery)
      return
    }

    if (node.type === 'atrule' && node.name === 'media') {
      walkNodes(node, state, `${MEDIA_QUERY_PREFIX}${node.params.trim()}`)
      return
    }

    state.issues.push(`Unsupported CSS node "${node.type}".`)
  })
}

function applyRule(
  rule: Rule,
  state: {
    baseFontSize: number
    styles: HtmlStyles
    issues: string[]
  },
  mediaQuery?: string,
) {
  const selectors = rule.selector
    .split(',')
    .map((selector) => selector.trim())
    .filter(Boolean)

  for (const selector of selectors) {
    if (!SIMPLE_SELECTOR.test(selector)) {
      state.issues.push(`Unsupported selector "${selector}".`)
      continue
    }

    const declarationContext: DeclarationContext = {
      baseFontSize: state.baseFontSize,
      currentFontSize: state.baseFontSize,
    }
    const styleBlock: ReactPdfStyle = {}

    rule.nodes?.forEach((node) => {
      if (node.type !== 'decl') {
        if (node.type !== 'comment') {
          state.issues.push(`Unsupported rule child "${node.type}" in selector "${selector}".`)
        }
        return
      }

      try {
        convertDeclaration(node, styleBlock, declarationContext)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        state.issues.push(
          `Failed to convert declaration "${node.toString()}" in selector "${selector}": ${message}`,
        )
      }
    })

    if (Object.keys(styleBlock).length === 0) {
      continue
    }

    const existingStyle = ensureStyleBlock(state.styles, selector)

    if (mediaQuery) {
      const currentMediaStyle = ensureNestedStyle(existingStyle, mediaQuery)
      Object.assign(currentMediaStyle, styleBlock)
      continue
    }

    Object.assign(existingStyle, styleBlock)
  }
}

function ensureStyleBlock(styles: HtmlStyles, selector: string): ReactPdfStyle {
  const existing = styles[selector]
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    return existing as ReactPdfStyle
  }

  const created: ReactPdfStyle = {}
  styles[selector] = created
  return created
}

function ensureNestedStyle(style: ReactPdfStyle, key: string): ReactPdfStyle {
  const existing = style[key]
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    return existing as ReactPdfStyle
  }

  const created: ReactPdfStyle = {}
  style[key] = created
  return created
}

function convertDeclaration(
  declaration: Declaration,
  style: ReactPdfStyle,
  context: DeclarationContext,
) {
  const property = declaration.prop.trim().toLowerCase()
  const normalizedProperty = toCamelCase(property)
  const value = declaration.value.trim()

  if (property === 'font') {
    applyFontShorthand(value, style, context)
    return
  }

  if (property === 'margin' || property === 'padding') {
    applySpacingShorthand(property, value, style, context)
    return
  }

  if (property === 'border') {
    applyBorderShorthand('border', value, style, context)
    return
  }

  if (property.startsWith('border-') && property.endsWith('-width')) {
    ensureSupportedProperty(normalizedProperty, declaration)
    style[normalizedProperty] = parseLength(value, context)
    return
  }

  if (property.startsWith('border-') && property.endsWith('-color')) {
    ensureSupportedProperty(normalizedProperty, declaration)
    style[normalizedProperty] = value
    return
  }

  if (property.startsWith('border-') && property.endsWith('-style')) {
    ensureSupportedProperty(normalizedProperty, declaration)
    style[normalizedProperty] = value
    return
  }

  if (['border-top', 'border-right', 'border-bottom', 'border-left'].includes(property)) {
    applyBorderShorthand(
      normalizedProperty as 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft',
      value,
      style,
      context,
    )
    return
  }

  ensureSupportedProperty(normalizedProperty, declaration)

  switch (normalizedProperty) {
    case 'fontFamily':
      style.fontFamily = normalizeFontFamily(value)
      return
    case 'fontSize': {
      const fontSize = parseFontSize(value, context)
      context.currentFontSize = fontSize
      style.fontSize = fontSize
      return
    }
    case 'fontWeight':
      style.fontWeight = normalizeFontWeight(value)
      return
    case 'lineHeight':
      style.lineHeight = parseLineHeight(value, context)
      return
    case 'opacity':
    case 'aspectRatio':
    case 'flex':
    case 'flexGrow':
    case 'flexShrink':
    case 'zIndex':
    case 'maxLines':
      style[normalizedProperty] = parseNumericValue(value)
      return
    case 'textDecoration':
      style.textDecoration = normalizeWhitespace(value)
      return
    case 'display':
    case 'direction':
    case 'flexDirection':
    case 'flexFlow':
    case 'flexWrap':
    case 'justifyContent':
    case 'alignContent':
    case 'alignItems':
    case 'alignSelf':
    case 'position':
    case 'overflow':
    case 'textAlign':
    case 'textDecorationColor':
    case 'textDecorationStyle':
    case 'textOverflow':
    case 'textTransform':
    case 'verticalAlign':
    case 'objectFit':
    case 'objectPosition':
    case 'transform':
    case 'transformOrigin':
    case 'borderStyle':
    case 'borderTopStyle':
    case 'borderRightStyle':
    case 'borderBottomStyle':
    case 'borderLeftStyle':
    case 'borderColor':
    case 'borderTopColor':
    case 'borderRightColor':
    case 'borderBottomColor':
    case 'borderLeftColor':
    case 'backgroundColor':
    case 'color':
    case 'fontStyle':
      style[normalizedProperty] = value
      return
    default:
      if (LENGTH_PROPERTIES.has(normalizedProperty)) {
        style[normalizedProperty] = parseLength(value, context)
        return
      }

      style[normalizedProperty] = NUMBER_VALUE.test(value) ? Number(value) : value
  }
}

function ensureSupportedProperty(property: string, declaration: Declaration) {
  if (!SUPPORTED_PROPERTIES.has(property)) {
    throw new Error(`Property "${declaration.prop}" is not supported by react-pdf.`)
  }
}

function applySpacingShorthand(
  property: 'margin' | 'padding',
  value: string,
  style: ReactPdfStyle,
  context: DeclarationContext,
) {
  const values = splitWhitespace(value).map((token) => parseLength(token, context))
  if (values.length === 0 || values.length > 4) {
    throw new Error(`Invalid ${property} shorthand "${value}".`)
  }

  if (values.length === 1) {
    style[property] = values[0]
    return
  }

  const [top, right = top, bottom = top, left = right] = values
  style[`${property}Top`] = top
  style[`${property}Right`] = right
  style[`${property}Bottom`] = bottom
  style[`${property}Left`] = left
}

function applyBorderShorthand(
  property: 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft',
  value: string,
  style: ReactPdfStyle,
  context: DeclarationContext,
) {
  const tokens = splitWhitespace(value)
  if (tokens.length === 0) {
    throw new Error(`Invalid ${property} shorthand "${value}".`)
  }

  for (const token of tokens) {
    if (BORDER_STYLES.has(token)) {
      style[`${property}Style`] = token
      continue
    }

    if (LENGTH_VALUE.test(token)) {
      style[`${property}Width`] = parseLength(token, context)
      continue
    }

    style[`${property}Color`] = token
  }
}

function applyFontShorthand(value: string, style: ReactPdfStyle, context: DeclarationContext) {
  if (value === 'inherit' || value === 'initial' || value === 'unset' || value === 'revert') {
    return
  }

  const match = value.match(FONT_SIZE_VALUE)
  if (match) {
    const [matched, sizeToken, lineHeightToken] = match
    const prefix = value.slice(0, match.index).trim()
    const suffix = value.slice((match.index ?? 0) + matched.length).trim()

    applyFontPrelude(prefix, style)

    if (!sizeToken) {
      throw new Error(`Invalid font shorthand "${value}".`)
    }

    const fontSize = parseLength(sizeToken, context)
    if (typeof fontSize === 'number') {
      context.currentFontSize = fontSize
      style.fontSize = fontSize
    }

    if (lineHeightToken) {
      style.lineHeight = parseLineHeight(lineHeightToken, context)
    }

    if (suffix) {
      style.fontFamily = normalizeFontFamily(suffix)
    }
    return
  }

  applyFontPrelude(value, style)
}

function applyFontPrelude(value: string, style: ReactPdfStyle) {
  for (const token of splitWhitespace(value)) {
    if (token === 'italic' || token === 'oblique' || token === 'normal') {
      style.fontStyle = token
      continue
    }

    if (isFontWeightToken(token)) {
      style.fontWeight = normalizeFontWeight(token)
    }
  }
}

function parseLineHeight(value: string, context: DeclarationContext) {
  if (NUMBER_VALUE.test(value)) {
    return Number(value) * context.currentFontSize
  }
  if (value.endsWith('%')) {
    return roundNumber((Number(value.slice(0, -1)) / 100) * context.currentFontSize)
  }
  return parseLength(value, context)
}

function parseFontSize(value: string, context: DeclarationContext) {
  if (value.endsWith('%')) {
    return roundNumber((Number(value.slice(0, -1)) / 100) * context.currentFontSize)
  }

  const fontSize = parseLength(value, context)
  if (typeof fontSize !== 'number') {
    throw new Error(`Unsupported font-size value "${value}".`)
  }

  return fontSize
}

function parseLength(value: string, context: DeclarationContext): number | string {
  if (value === '0') {
    return 0
  }

  const match = value.match(LENGTH_VALUE)
  if (!match) {
    throw new Error(`Unsupported length value "${value}".`)
  }

  const numericValue = Number(match[1])
  const unit = match[2]?.toLowerCase()

  switch (unit) {
    case undefined:
    case 'pt':
      return numericValue
    case 'px':
      return roundNumber(numericValue * PX_TO_PT)
    case 'em':
      return roundNumber(numericValue * context.currentFontSize)
    case 'rem':
      return roundNumber(numericValue * context.baseFontSize)
    case '%':
    case 'vw':
    case 'vh':
    case 'in':
    case 'mm':
    case 'cm':
      return `${stripTrailingZero(numericValue)}${unit}`
    default:
      throw new Error(`Unsupported unit "${unit}".`)
  }
}

function parseNumericValue(value: string) {
  if (!NUMBER_VALUE.test(value)) {
    throw new Error(`Expected numeric value, received "${value}".`)
  }
  return Number(value)
}

function normalizeFontFamily(value: string) {
  const families = value
    .split(',')
    .map((family) => family.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)

  const preferredFamily = families.find(
    (family) => !GENERIC_FONT_FAMILIES.has(family.toLowerCase()),
  )
  return preferredFamily ?? families[0] ?? value
}

function normalizeFontWeight(value: string) {
  if (NUMBER_VALUE.test(value)) {
    return Number(value)
  }
  return value
}

function isFontWeightToken(value: string) {
  return NUMBER_VALUE.test(value) || ['normal', 'bold', 'bolder', 'lighter'].includes(value)
}

function toCamelCase(value: string) {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

function splitWhitespace(value: string) {
  return value.split(/\s+/).filter(Boolean)
}

function normalizeWhitespace(value: string) {
  return splitWhitespace(value).join(' ')
}

function roundNumber(value: number) {
  return Number(value.toFixed(4))
}

function stripTrailingZero(value: number) {
  return Number.isInteger(value) ? String(value) : String(value)
}
