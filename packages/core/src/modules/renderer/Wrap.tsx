import { MDXProvider } from '@mdx-js/react'
import { Document, Page, StyleSheet } from '@react-pdf/renderer'
import { MdxBaseUrlContext } from '../../elements/utils.js'

export interface WrapProps {
  lang?: string | undefined
  pageSize?: 'A4' | 'LETTER' | { width: number; height: number } | undefined
  components?: Record<string, React.ComponentType<any>> | undefined
  baseUrl?: URL | undefined
  children: React.ReactNode
}
export function Wrap(props: WrapProps) {
  const fontFamily = props.lang?.includes('zh') ? 'Noto Sans SC' : 'Helvetica'

  const styles = StyleSheet.create({
    page: {
      fontFamily,
      padding: 20,
    },
  })

  return (
    <Document>
      <Page size={props.pageSize ?? 'A4'} style={styles.page}>
        <MdxBaseUrlContext.Provider value={props.baseUrl ?? null}>
          <MDXProvider components={props.components}>{props.children}</MDXProvider>
        </MdxBaseUrlContext.Provider>
      </Page>
    </Document>
  )
}
