// ---------------------------------------------------------------------------
// Case conversion
// ---------------------------------------------------------------------------

function toCamelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

export { toCamelCase }
