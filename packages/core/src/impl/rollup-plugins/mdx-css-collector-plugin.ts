import type { Plugin } from 'rollup'

const BARE_CSS_IMPORT_RE = /^import\s+(["'])(.+?\.css(?:\?[^"']*)?)\1;?\s*$/gm
const STYLE_RUNTIME_CODE = `
import { createContext, createElement, useContext } from 'react';

const StyleContext = createContext(null);

function createStyleCollector() {
  const styles = [];
  const seen = new Set();

  return {
    add(css) {
      if (!css || seen.has(css)) {
        return;
      }

      seen.add(css);
      styles.push(css);
    },
    toString() {
      return styles.join('\\n');
    }
  };
}

function StyleProvider(props) {
  return createElement(StyleContext.Provider, { value: props.collector }, props.children);
}

function useStyle(css) {
  const collector = useContext(StyleContext);

  if (collector) {
    collector.add(css);
  }
}

export { createStyleCollector, StyleProvider };
`

export function mdxCssCollectorPlugin(): Plugin {
  return {
    name: 'mdx-css-collector',
    transform(code, id) {
      if (!id.endsWith('.mdx')) {
        return null
      }

      let cssImportIndex = 0
      const cssVariableNames: string[] = []
      const transformedImports = code.replace(
        BARE_CSS_IMPORT_RE,
        (_, quote: string, source: string) => {
          const variableName = `__mdxCvCss${cssImportIndex++}`
          cssVariableNames.push(variableName)
          return `import ${variableName} from ${quote}${source}${quote};`
        },
      )

      if (cssVariableNames.length === 0) {
        return null
      }

      const cssCollectionCode = cssVariableNames
        .map((variableName) => `  useStyle(${variableName});`)
        .join('\n')
      const withRuntimeImport = `${STYLE_RUNTIME_CODE}\n${transformedImports}`

      if (!withRuntimeImport.includes('function MDXContent(')) {
        this.error(`Unable to inject CSS collector into ${id}: MDXContent function not found.`)
      }

      return {
        code: withRuntimeImport.replace(
          /function MDXContent\s*\(([^)]*)\)\s*\{/,
          (match) => `${match}\n${cssCollectionCode}\n`,
        ),
        map: null,
      }
    },
  }
}
