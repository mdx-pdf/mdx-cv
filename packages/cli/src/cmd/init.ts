import { Command } from 'commander'

export const init = new Command('init')

init.description('Initialize a new MDX CV project.').action(() => {
  console.log('Initializing a new MDX CV project...')
})
