import { program } from 'commander'

import { html2md } from './evaluates/html2md.js'
import { md2html } from './evaluates/md2html.js'

program.addCommand(md2html).addCommand(html2md)

if (import.meta.main) {
  program.parseAsync()
}
