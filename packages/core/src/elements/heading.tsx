/* @jsxRuntime automatic */
import { Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

export function Heading({ children, depth = 1 }: { children: ReactNode; depth?: number }) {
  const fontSize = 24 - (depth - 1) * 3
  return (
    <View>
      <Text style={{ fontSize, fontWeight: 'bold' }}>{children}</Text>
    </View>
  )
}

function H1({ children }: { children: ReactNode }) {
  return <Heading depth={1}>{children}</Heading>
}

function H2({ children }: { children: ReactNode }) {
  return <Heading depth={2}>{children}</Heading>
}

function H3({ children }: { children: ReactNode }) {
  return <Heading depth={3}>{children}</Heading>
}

function H4({ children }: { children: ReactNode }) {
  return <Heading depth={4}>{children}</Heading>
}

function H5({ children }: { children: ReactNode }) {
  return <Heading depth={5}>{children}</Heading>
}

function H6({ children }: { children: ReactNode }) {
  return <Heading depth={6}>{children}</Heading>
}

export { H1, H2, H3, H4, H5, H6 }
