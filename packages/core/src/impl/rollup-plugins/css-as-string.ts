import type { Plugin } from 'rollup'

export function cssAsString(): Plugin {
  return {
    name: 'css-as-string',
    transform(code, id) {
      if (!id.endsWith('.css')) return

      return {
        code: `export default ${JSON.stringify(code)};`,
        map: null,
      }
    },
  }
}
