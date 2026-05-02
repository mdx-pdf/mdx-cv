export type { Option } from './render.js'
export { render } from './render.js'

if (import.meta.main) {
  async function cli() {
    const { render } = await import('./render.js')
    const { readFile, writeFile } = await import('node:fs/promises')
    const { basename, dirname, extname, join } = await import('node:path')

    const [input, ...args] = process.argv.slice(2)
    if (!input) {
      console.error('Usage: node index.js <input> [options]')
      process.exit(1)
    }

    const outputDir = args[0] || dirname(input)

    render(input, {
      outputDir,
    }).catch((err) => {
      console.error('Error:', err)
      process.exit(1)
    })
  }
  cli()
}
