import postcss from 'postcss'
import loadConfig from 'postcss-load-config'
import type { Plugin } from 'rollup'

export function cssAsString(): Plugin {
  let config: any
  return {
    name: 'css-as-string',
    async buildStart() {
      config = await loadConfig()
    },
    async transform(code, id) {
      if (!id.endsWith('.css')) return

      const result = await postcss(config.plugins).process(code, {
        from: id,
      })

      return {
        code: `export default ${JSON.stringify(result.css)};`,
        map: null,
      }
    },
  }
}
