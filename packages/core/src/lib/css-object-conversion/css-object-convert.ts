import postcss from 'postcss'
import postcssJs from 'postcss-js'
import prettier from 'prettier'

export function cssToObject(css: string) {
  const root = postcss.parse(css)
  return postcssJs.objectify(root)
}

export async function objectToCss(styleObject: Record<string, Record<string, string>>) {
  const root = postcssJs.parse(styleObject)
  const css = root.toString()
  return await prettier.format(css, { parser: 'css' })
}
