import fs from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { compile } from '@mdx-js/mdx'
import { MDXProvider } from '@mdx-js/react'
import { Document, Font, Link, Page, renderToFile, Text, View } from '@react-pdf/renderer'
import type { ReactElement, ReactNode } from 'react'
import { Children, cloneElement, isValidElement } from 'react'

Font.register({
  family: 'Noto Sans SC',
  src: fileURLToPath(new URL('./assets/NotoSansSC-Regular.ttf', import.meta.url)),
})

function stripWhitespaceNodes(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (typeof child === 'string') {
      return child.trim() === '' ? null : child
    }

    if (!isValidElement<{ children?: ReactNode }>(child)) {
      return child
    }

    if (!('children' in child.props) || child.props.children == null) {
      return child
    }

    return cloneElement(child, {
      children: stripWhitespaceNodes(child.props.children),
    })
  })
}

function PdfRoot({ children }: { children: ReactNode }) {
  return <View>{stripWhitespaceNodes(children)}</View>
}

const ReactPDFComponentMap = {
  h1: (props: { children: ReactNode }) => (
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{props.children}</Text>
  ),
  strong: (props: { children: ReactNode }) => (
    <Text style={{ fontWeight: 'bold' }}>{props.children}</Text>
  ),
  p: (props: { children: ReactNode }) => <Text style={{ fontSize: 12 }}>{props.children}</Text>,
  ul: (props: { children: ReactNode }) => (
    <View style={{ border: '1px solid black' }}>{stripWhitespaceNodes(props.children)}</View>
  ),
  li: (props: { children: ReactNode }) => (
    <Text
      style={{
        fontSize: 12,
        marginLeft: 10,
        border: '1px solid blue',
      }}
    >
      - {props.children}
    </Text>
  ),
  a: (props: { children: ReactNode; href: string }) => (
    <Link src={props.href} style={{ fontSize: 12, color: 'blue' }}>
      {props.children}
    </Link>
  ),
  wrapper: PdfRoot,
}

async function convertMdxToReact(mdxContent: string) {
  const result = await compile(mdxContent, {
    providerImportSource: '@mdx-js/react',
  })
  const js = String(result).replaceAll('"\\n"', 'null')
  return js
}

async function loadMdxComponent(mdxJsCode: string, inputPath: string) {
  const tempModulePath = path.join(path.dirname(inputPath), `.temp_mdx_${Date.now()}.mjs`)

  try {
    await writeFile(tempModulePath, mdxJsCode, 'utf-8')
    const module = await import(pathToFileURL(tempModulePath).href)
    return module.default as (props: { components?: Record<string, unknown> }) => ReactElement
  } finally {
    if (fs.existsSync(tempModulePath)) {
      fs.unlinkSync(tempModulePath)
    }
  }
}

async function renderMdxToPdf(mdxJsCode: string, inputPath: string) {
  const MDXContent = await loadMdxComponent(mdxJsCode, inputPath)
  const outputPath = path.join(path.dirname(inputPath), 'output.pdf')

  const document = (
    <Document>
      <Page size="A4" style={{ padding: 24, gap: 8, fontFamily: 'Noto Sans SC' }}>
        <MDXProvider components={ReactPDFComponentMap}>
          <MDXContent />
        </MDXProvider>
      </Page>
    </Document>
  )

  await renderToFile(document, outputPath)

  return outputPath
}

async function main(inputPath: string) {
  const content = await readFile(inputPath, 'utf-8')

  const reactContent = await convertMdxToReact(content)
  const jsxOutputDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../output')
  await writeFile(path.join(jsxOutputDir, 'output.jsx'), reactContent, 'utf-8')
  console.log('Generated JSX at: ', jsxOutputDir)

  const pdfPath = await renderMdxToPdf(reactContent, inputPath)
  console.log('Rendered PDF: ', pdfPath)
}

if (import.meta.main) {
  const input = process.argv[2]

  if (input) {
    const inputpath = path.resolve(process.cwd(), input)
    console.log('Run with input: ', inputpath)

    await main(inputpath)
  } else {
    console.log('Run without input.')
  }
}
