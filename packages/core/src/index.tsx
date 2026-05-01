import { program } from 'commander'
import { render } from './impl/direct-convert.js'

program.addCommand(render)

if (import.meta.main) {
  program.parseAsync()
}
