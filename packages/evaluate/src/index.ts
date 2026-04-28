import { program } from 'commander'

import { html2md } from './evaluates/html2md.js'
import { md2html } from './evaluates/md2html.js'
import { mdx2jsx } from './evaluates/mdx2jsx.js'
import { mdxinspect } from './evaluates/mdxinspect.js'
import { rpdemo } from './evaluates/rpdemo.js'
import { rphdemo } from './evaluates/rphdemo.js'

program
  .addCommand(md2html)
  .addCommand(html2md)
  .addCommand(mdx2jsx)
  .addCommand(mdxinspect)
  .addCommand(rpdemo)
  .addCommand(rphdemo)

if (import.meta.main) {
  program.parseAsync()
}
