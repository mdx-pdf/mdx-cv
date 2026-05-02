import { compile } from '@mdx-js/mdx'

// outputFormat: 'function-body' produces code without top-level import statements;
// the react runtime is injected at run-time via run(), and relative imports are
// resolved via the baseUrl passed to run() — no temp files needed.
export async function mdxToJsx(mdx: string) {
  const result = await compile(mdx, {
    outputFormat: 'function-body',
    providerImportSource: '@mdx-js/react',
  })
  return String(result)
}

if (import.meta.main) {
  const input = process.argv[2]
  if (!input) {
    console.error('Usage: node mdx-to-jsx.js <input.mdx>')
    process.exit(1)
  }

  const { readFile } = await import('node:fs/promises')
  const content = await readFile(input, 'utf-8')
  const jsx = await mdxToJsx(content)
  console.log(jsx)
}
