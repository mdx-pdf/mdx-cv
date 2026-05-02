import { run } from '@mdx-js/mdx'
import { useMDXComponents } from '@mdx-js/react'
import type { ReactElement } from 'react'
import * as runtime from 'react/jsx-runtime'

// baseUrl tells run() how to resolve relative imports inside the compiled MDX
// (e.g. `import { Resume } from "./resume"` → resolved from the original MDX file's directory).
// useMDXComponents is injected so the compiled code's _provideComponents() call
// links up with the MDXProvider context provided by Wrap.tsx.
export async function loadJsx(jsx: string, baseUrl: URL) {
  const { default: MDXComponent } = await run(jsx, {
    ...(runtime as Parameters<typeof run>[1]),
    useMDXComponents,
    baseUrl,
  })
  return MDXComponent as (props: { components?: Record<string, unknown> }) => ReactElement
}
