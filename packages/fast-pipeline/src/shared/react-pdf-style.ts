export const VALID_UNITS = ['pt', 'in', 'mm', 'cm', '%', 'vw', 'vh'] as const

export type ValidUnit = (typeof VALID_UNITS)[number]

const VALID_REACT_PDF_CSS_PROPERTIES_BY_CATEGORY = {
  flexbox: [
    'alignContent',
    'alignItems',
    'alignSelf',
    'flex',
    'flexDirection',
    'flexWrap',
    'flexFlow',
    'flexGrow',
    'flexShrink',
    'flexBasis',
    'justifyContent',
    'gap',
    'rowGap',
    'columnGap',
  ],
  layout: [
    'aspectRatio',
    'bottom',
    'display',
    'left',
    'position', // relative, absolute, static
    'right',
    'top',
    'overflow',
    'zIndex',
  ],
  dimension: ['height', 'maxHeight', 'minHeight', 'width', 'maxWidth', 'minWidth'],
  color: ['backgroundColor', 'color', 'opacity'],
  text: [
    'direction', // ltr, rtl
    'fontSize',
    'fontFamily',
    'fontStyle',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'maxLines',
    'textAlign',
    'textDecoration',
    'textDecorationColor',
    'textDecorationStyle',
    'textIndent',
    'textOverflow',
    'textTransform',
    'verticalAlign', // sub, super
  ],
  'sizing/positioning': ['object-fit', 'object-position'],
  'margin & padding': [
    'margin',
    'marginHorizontal',
    'marginVertical',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'padding',
    'paddingHorizontal',
    'paddingVertical',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
  ],
  transformations: [
    'transform:rotate',
    'transform:scale',
    'transform:scaleX',
    'transform:scaleY',
    'transform:translate',
    'transform:translateX',
    'transform:translateY',
    'transform:skew',
    'transform:skewX',
    'transform:skewY',
    'transform:matrix',
    'transformOrigin',
  ],
  borders: [
    'border',
    'borderColor',
    'borderStyle',
    'borderWidth',
    'borderTop',
    'borderTopColor',
    'borderTopStyle',
    'borderTopWidth',
    'borderRight',
    'borderRightColor',
    'borderRightStyle',
    'borderRightWidth',
    'borderBottom',
    'borderBottomColor',
    'borderBottomStyle',
    'borderBottomWidth',
    'borderLeft',
    'borderLeftColor',
    'borderLeftStyle',
    'borderLeftWidth',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomRightRadius',
    'borderBottomLeftRadius',
  ],
}

const VALID_REACT_PDF_HTML_CSS_PROPERTIES = [
  'borderCollapse',
  'borderSpacing',
  'listStyle',
  'listStyleType',
] as const

const VALID_CSS_PROPERTIES = [
  ...Object.values(VALID_REACT_PDF_CSS_PROPERTIES_BY_CATEGORY).flat(),
  ...VALID_REACT_PDF_HTML_CSS_PROPERTIES,
] as const

export function isValidCssProperty(
  property: string,
): property is (typeof VALID_CSS_PROPERTIES)[number] {
  return VALID_CSS_PROPERTIES.includes(property)
}
