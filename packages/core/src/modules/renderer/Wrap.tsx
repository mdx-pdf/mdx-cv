import { MDXProvider } from '@mdx-js/react'
import { Document, Page } from '@react-pdf/renderer'

export interface WrapProps {
  lang?: string | undefined
  pageSize?: 'A4' | 'LETTER' | { width: number; height: number } | undefined
  components?: Record<string, React.ComponentType<any>> | undefined
  children: React.ReactNode
}
export function Wrap(props: WrapProps) {
  const fontFamily = props.lang?.includes('zh') ? 'Noto Sans SC' : 'Helvetica'

  return (
    <Document>
      <Page size={props.pageSize ?? 'A4'} style={{ fontFamily }}>
        <MDXProvider components={props.components}>{props.children}</MDXProvider>
      </Page>
    </Document>
  )
}
