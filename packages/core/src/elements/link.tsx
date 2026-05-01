import { Link } from '@react-pdf/renderer'
import type { ReactNode } from 'react'

export function LinkComponent({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link src={href} style={{ fontSize: 8, color: 'blue' }}>
      {children}
    </Link>
  )
}
