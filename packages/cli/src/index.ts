import { program } from 'commander'

program
  .name('mdx-cv')
  .description('A CLI tool for generating PDF resumes from MDX files.')
  .version('0.0.0')

program
  .command('init')
  .description('Initialize a new MDX CV project.')
  .action(() => {
    console.log('Initializing a new MDX CV project...')
  })

program.parse()
