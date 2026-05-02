#!/usr/bin/env node
import { program } from 'commander'

import pkg from '../package.json' with { type: 'json' }
import { init } from './cmd/init.js'
import { render } from './cmd/render.js'

const { version } = pkg

program
  .name('mdxcv')
  .description('A CLI tool for generating PDF resumes from MDX files.')
  .version(version)

program.addCommand(render).addCommand(init)

await program.parseAsync()
