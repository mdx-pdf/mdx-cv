import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ReactPDF, { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { Command } from 'commander'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main(output: string) {
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
      fontSize: '10px',
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
          <View style={{ position: 'relative' }}>
            <Text>Left #3</Text>
            <View style={{ position: 'absolute', right: 0 }}>
              <Text>Right #3</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )

  await ReactPDF.render(<MyDocument />, output)
}

export const rpdemo = new Command('rpdemo')

rpdemo
  .option('-o, --output [path]', 'output path for the generated PDF file')
  // .argument('<input>', 'path to the input HTML file')
  .action(async (options) => {
    // const inputDir = dirname(input)
    const output = options.output ?? join(__dirname, '..', 'assets', 'react-pdf_demo.pdf')
    await main(output)
  })
