import { compile } from '@mdx-js/mdx'

type EstreeNode = Record<string, unknown>

// Recma plugin: operates on the compiled JS estree AST.
// MDX serializes block-level elements as:
//   _jsxs(Fragment, { children: [_jsx(h1, ...), "\n", _jsx(p, ...)] })
// The "\n" string literals are injected by the code generator between blocks.
// This plugin walks the estree and removes whitespace-only Literal children
// from any ArrayExpression that is assigned to a "children" property.
function recmaRemoveWhitespaceChildren() {
  return (tree: EstreeNode) => {
    const walk = (node: EstreeNode) => {
      // Target: Property node with key "children" whose value is an ArrayExpression
      if (
        node.type === 'Property' &&
        (node.key as EstreeNode)?.type === 'Identifier' &&
        (node.key as EstreeNode)?.name === 'children' &&
        (node.value as EstreeNode)?.type === 'ArrayExpression'
      ) {
        const arr = node.value as EstreeNode
        arr.elements = (arr.elements as EstreeNode[]).filter((el) => {
          if (el?.type !== 'Literal') return true
          const v = el.value
          return !(typeof v === 'string' && v.trim() === '')
        })
      }
      for (const val of Object.values(node)) {
        if (Array.isArray(val)) {
          for (const item of val) {
            if (item && typeof item === 'object' && 'type' in item) walk(item as EstreeNode)
          }
        } else if (val && typeof val === 'object' && 'type' in (val as object)) {
          walk(val as EstreeNode)
        }
      }
    }
    walk(tree)
  }
}

// outputFormat: 'function-body' produces code without top-level import statements;
// the react runtime is injected at run-time via run(), and relative imports are
// resolved via the baseUrl passed to run() — no temp files needed.
export async function mdxToJsx(mdx: string) {
  const result = await compile(mdx, {
    outputFormat: 'function-body',
    providerImportSource: '@mdx-js/react',
    recmaPlugins: [recmaRemoveWhitespaceChildren],
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
