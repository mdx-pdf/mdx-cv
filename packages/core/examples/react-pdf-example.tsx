import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ReactPDF, { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    // flexDirection: 'row',
    backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    backgroundColor: '#f34242',
  },
  section2: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    backgroundColor: '#42f354',
  },
})

// Create Document Component
const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Section #1</Text>
        <View style={styles.section2}>
          <Text>Section #2</Text>
          <Text>Section #2</Text>
          <Text>Section #2</Text>
          <Text>Section #2</Text>
        </View>
      </View>
    </Page>
  </Document>
)

ReactPDF.render(<MyDocument />, `${dirname(fileURLToPath(import.meta.url))}/output.pdf`)
