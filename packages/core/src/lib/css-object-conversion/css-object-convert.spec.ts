import { describe, expect, it } from 'vitest'
import { cssToObject, objectToCss } from './css-object-convert.js'

describe('css-object-convert', () => {
  it('should convert css string to object', () => {
    const css = `
      .container {
        display: flex;
        justify-content: center;
      }
      .item {
        color: red;
        font-size: 16px;
      }
    `
    const expected = {
      '.container': {
        display: 'flex',
        justifyContent: 'center',
      },
      '.item': {
        color: 'red',
        fontSize: '16px',
      },
    }
    expect(cssToObject(css)).toEqual(expected)
  })

  it('should convert object to css string', async () => {
    const obj = {
      '.container': {
        display: 'flex',
        'justify-content': 'center',
      },
      '.item': {
        color: 'red',
        'font-size': '16px',
      },
    }
    const expected = `.container {
  display: flex;
  justify-content: center;
}
.item {
  color: red;
  font-size: 16px;
}
`
    expect(await objectToCss(obj)).toEqual(expected)
  })
})
