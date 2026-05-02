import { basicRenderer, Renderer, type RendererOptions } from './modules/renderer/index.js'

export { basicRenderer, Renderer, type RendererOptions }

if (import.meta.main) {
  async function cli() {
    const inputPath = process.argv[2]
    if (!inputPath) {
      console.error('Usage: tsx renderer/index.ts <input.mdx> [outputDir]')
      process.exit(1)
    }

    const { resolve, join, dirname, basename, extname } = await import('node:path')
    const { createWriteStream } = await import('node:fs')
    const { pathToFileURL } = await import('node:url')
    const { readFile } = await import('node:fs/promises')

    const absInput = resolve(inputPath)
    const outputDir = process.argv[3] ? resolve(process.argv[3]) : dirname(absInput)
    const outputPath = join(outputDir, `${basename(absInput, extname(absInput))}.output.pdf`)

    const mdx = await readFile(absInput, 'utf-8')

    const stream = await basicRenderer(mdx, pathToFileURL(absInput), {
      debugfile: false,
    })

    const out = createWriteStream(outputPath)
    stream.pipe(out)
    await new Promise<void>((resolve, reject) => {
      out.on('finish', resolve)
      out.on('error', reject)
    })

    console.log('Rendered PDF:', outputPath)
  }
  cli()
}
