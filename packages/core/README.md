# @mdx-cv/core

Convert MDX documents to PDF using [`@react-pdf/renderer`](https://react-pdf.org/).

## How it works

```
MDX string
  │
  ▼ compile()           @mdx-js/mdx → function-body JS (no top-level imports)
  │                     recma plugin strips whitespace-only "\n" literals
  ▼ run()               inject react runtime + useMDXComponents + baseUrl
  │                     relative imports in MDX resolve from the source file's directory
  ▼ renderToStream()    MDXProvider maps HTML elements → react-pdf components
  │
  ▼ NodeJS.ReadableStream (PDF bytes)
```

No temp files are written to disk. The compiled function-body is executed in-memory with `run()`.

## Installation

```sh
pnpm add @mdx-cv/core
```

## Usage

### `basicRenderer`

```ts
import { basicRenderer } from "@mdx-cv/core";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const mdx = `
# John Doe

Software Engineer · john@example.com

## Experience

- Company A (2020–2024)
- Company B (2018–2020)
`;

const baseUrl = new URL("file:///path/to/resume.mdx");
const stream = await basicRenderer(mdx, baseUrl);

await pipeline(stream, createWriteStream("resume.pdf"));
```

### `Renderer` class

```ts
import { Renderer } from "@mdx-cv/core";

const renderer = new Renderer(mdx, baseUrl, {
  pageSize: "A4",
  lang: "en",
});

const stream = await renderer.renderToPdf();
```

### Options

| Option      | Type                                                    | Default | Description                                                 |
| ----------- | ------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| `pageSize`  | `'A4' \| 'LETTER' \| { width: number; height: number }` | `'A4'`  | PDF page size                                               |
| `lang`      | `string`                                                | —       | BCP 47 language tag. `zh*` selects Noto Sans SC font family |
| `debugfile` | `boolean`                                               | `false` | Write compiled JSX to `output.debug.jsx` for inspection     |

## Supported MDX elements

| MDX / HTML element | Rendered as              |
| ------------------ | ------------------------ |
| `h1`–`h6`          | Headings                 |
| `p`                | Paragraph                |
| `ul`, `ol`         | Unordered/ordered list   |
| `li`               | List item with bullet    |
| `blockquote`       | Block quote              |
| `pre` / `code`     | Code block / inline code |
| `strong`           | Bold text                |
| `em`               | Italic text              |
| `a`                | Link                     |
| `img`              | Image                    |
| `hr`               | Horizontal rule          |

### Images

Image `src` values are resolved in this order:

1. **HTTP/HTTPS** — passed through as-is
2. **`data:` URI** — passed through as-is
3. **`file://` URL** — converted to an absolute POSIX path via `fileURLToPath()`
4. **Relative path** — resolved against the MDX source file's directory (using the `baseUrl` you provide), then converted to an absolute POSIX path

```mdx
![Profile photo](./photo.jpg)
```

The `baseUrl` you pass to `basicRenderer` / `Renderer` determines which directory relative paths resolve from.

## Architecture

```
packages/core/src/
├── modules/
│   └── renderer/
│       ├── index.ts          Renderer class + basicRenderer export
│       ├── mdx-to-jsx.ts     compile() MDX → function-body JS (+ recma whitespace plugin)
│       ├── load-jsx.ts       run() function-body → React component (in-memory)
│       ├── mdx-to-pdf.tsx    renderToStream() React component → PDF stream
│       └── Wrap.tsx          Document/Page wrapper, provides MDXProvider + MdxBaseUrlContext
└── elements/
    ├── index.tsx             ElementMap: HTML tag → react-pdf component
    ├── utils.tsx             MdxBaseUrlContext, renderMixed(), markAsBlock()
    ├── heading.tsx
    ├── paragraph.tsx
    ├── list.tsx
    ├── image.tsx
    ├── link.tsx
    ├── code.tsx
    ├── blockquote.tsx
    ├── horizontal-rule.tsx
    ├── root.tsx
    ├── emphasis.tsx
    └── strong.tsx
```

### `renderMixed(children)`

react-pdf requires inline content (text, links, emphasis…) inside `<Text>` and block content (`<View>`-based components) outside `<Text>`. `renderMixed` handles mixed children automatically:

- Runs of inline nodes are collected into a single `<Text>`
- Block nodes (registered with `markAsBlock()`) are emitted directly

This is used internally by `Paragraph`, `ListItem`, and any element that can contain both inline and block children.

## Development

```sh
# Run tests
pnpm test

# Type-check
pnpm typecheck

# Build
pnpm build
```
