import type { ReactNode } from 'react'

import { Emphasis } from './emphasis.js'
import { Heading } from './heading.js'
import { LinkComponent } from './link.js'
import { ListItem, ol, ul } from './list.js'
import { Paragraph } from './paragraph.js'
import { DocRoot } from './root.js'
import { Strong } from './strong.js'

export const ElementMap = {
  h1: ({ children }: { children: ReactNode }) => <Heading depth={1}>{children}</Heading>,
  h2: ({ children }: { children: ReactNode }) => <Heading depth={2}>{children}</Heading>,
  h3: ({ children }: { children: ReactNode }) => <Heading depth={3}>{children}</Heading>,
  h4: ({ children }: { children: ReactNode }) => <Heading depth={4}>{children}</Heading>,
  h5: ({ children }: { children: ReactNode }) => <Heading depth={5}>{children}</Heading>,
  h6: ({ children }: { children: ReactNode }) => <Heading depth={6}>{children}</Heading>,
  p: Paragraph,
  ul,
  ol,
  li: ListItem,
  strong: Strong,
  em: Emphasis,
  a: LinkComponent,
  wrapper: DocRoot,
}
