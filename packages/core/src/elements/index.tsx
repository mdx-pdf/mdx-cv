import { Blockquote } from './blockquote.js'
import { BlockCode, InlineCode } from './code.js'
import { Emphasis } from './emphasis.js'
import { H1, H2, H3, H4, H5, H6 } from './heading.js'
import { HorizontalRule } from './horizontal-rule.js'
import { ImageComponent } from './image.js'
import { LinkComponent } from './link.js'
import { ListItem, OL, UL } from './list.js'
import { Paragraph } from './paragraph.js'
import { DocRoot } from './root.js'
import { Strong } from './strong.js'

export const ElementMap = {
  // Block-level
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: Paragraph,
  blockquote: Blockquote,
  ul: UL,
  ol: OL,
  li: ListItem,
  hr: HorizontalRule,
  // Text-level
  code: InlineCode,
  pre: BlockCode,
  strong: Strong,
  em: Emphasis,
  // Object
  a: LinkComponent,
  img: ImageComponent,
  wrapper: DocRoot,
}
