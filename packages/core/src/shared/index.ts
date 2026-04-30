// ---------------------------------------------------------------------------
// Case conversion
// ---------------------------------------------------------------------------

function toCamelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

export { toCamelCase, toKebabCase }
