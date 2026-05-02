// Plain ESM without JSX syntax — can be dynamically imported by Node.js without a loader.

import { Text } from '@react-pdf/renderer'
import { jsx } from 'react/jsx-runtime'

export function SimpleCard({ title } = {}) {
  return jsx(Text, { children: title ?? 'Hello from SimpleCard' })
}
