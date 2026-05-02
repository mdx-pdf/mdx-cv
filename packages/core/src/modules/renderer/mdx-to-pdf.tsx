import { renderToStream } from '@react-pdf/renderer'

import { ElementMap } from '../../elements/index.js'
import { Wrap, type WrapProps } from './Wrap.js'

type PDFRenderOptions = Omit<WrapProps, 'children'>
export async function renderMdxToPdf(
  MDXComponent: React.ComponentType<Record<string, never>>,
  options: PDFRenderOptions,
) {
  const props = {
    lang: options.lang,
    pageSize: options.pageSize,
    components: ElementMap,
  }

  const PDF = () => (
    <Wrap {...props}>
      <MDXComponent />
    </Wrap>
  )

  return await renderToStream(<PDF />)
}
