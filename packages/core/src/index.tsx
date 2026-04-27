import { resolve } from 'node:path'
import { main } from './impl/fast-pipeline.js'

if (import.meta.main) {
  const input = process.argv[2]

  if (input) {
    const inputpath = resolve(process.cwd(), input)
    console.log('Run with input: ', inputpath)

    await main(inputpath)
  } else {
    console.log('Run without input.')
  }
}
