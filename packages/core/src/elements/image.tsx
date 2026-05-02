/* @jsxRuntime automatic */
import { fileURLToPath } from 'node:url'
import { Image, StyleSheet } from '@react-pdf/renderer'
import { markAsBlock, useMdxBaseUrl } from './utils.js'

const defaultStyle = StyleSheet.create({
  image: {
    width: 200,
  },
})

export function ImageComponent({
  src,
  width,
  height,
}: {
  src: string
  width?: number | string
  height?: number | string
}) {
  const baseUrl = useMdxBaseUrl()
  const resolvedSrc = resolveImageSrc(src, baseUrl)
  const style =
    width != null || height != null
      ? { ...(width != null && { width }), ...(height != null && { height }) }
      : defaultStyle.image
  return <Image src={resolvedSrc} style={style} />
}
markAsBlock(ImageComponent)

function resolveImageSrc(src: string, baseUrl: URL | null): string {
  if (!src || src.startsWith('http') || src.startsWith('data:')) {
    return src
  }
  // file:// URL → convert to absolute POSIX path (react-pdf doesn't accept file:// scheme)
  if (src.startsWith('file:')) {
    return fileURLToPath(src)
  }
  // Relative path: resolve against the MDX file's directory, then convert to absolute path
  if (baseUrl) {
    const resolved = new URL(src, new URL('.', baseUrl))
    return fileURLToPath(resolved)
  }
  return src
}
