import { Emphasis } from './emphasis.js'
import { H1, H2, H3, H4, H5, H6 } from './heading.js'
import { LinkComponent } from './link.js'
import { ListItem, OL, UL } from './list.js'
import { Paragraph } from './paragraph.js'
import { DocRoot } from './root.js'
import { Strong } from './strong.js'

export const ElementMap = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: Paragraph,
  ul: UL,
  ol: OL,
  li: ListItem,
  strong: Strong,
  em: Emphasis,
  a: LinkComponent,
  wrapper: DocRoot,
}
