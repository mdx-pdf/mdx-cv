/* @jsxRuntime automatic */
import { Link, StyleSheet } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

const defaultStyle = StyleSheet.create({
  link: {
    fontSize: 8,
    color: 'blue',
  },
})

export function LinkComponent({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link src={href} style={defaultStyle.link}>
      {children}
    </Link>
  )
}
