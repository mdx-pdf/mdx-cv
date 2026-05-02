# MDX-CV (WIP)

Generate professional resumes/CVs from MDX files into PDF. Write your resume in Markdown with JSX support, get a styled PDF out.

## Quick Start

```bash
pnpm install

cd packages/cli
pnpm start render path/to/your-resume.mdx
```

## Packages

| Package | Description |
|---------|-------------|
| [`@mdx-cv/cli`](./packages/cli/) | CLI tool — `mdxcv render resume.mdx` |
| [`@mdx-cv/core`](./packages/core/) | Core library — MDX string in, PDF stream out |
| `@mdx-cv/fast-pipeline` | Alternative pipeline using Rollup + react-pdf-html (supports external `.jsx`/`.css` imports) |
| `@mdx-cv/evaluate` | Dev utilities — md2html, html2md, mdx2jsx, mdxinspect, etc. |

## Usage

### CLI

```bash
# Render an MDX file to PDF
pnpm start render resume.mdx

# With options
pnpm start render resume.mdx -f          # debug output
pnpm start render resume.mdx -o ./out    # custom output dir
pnpm start render resume.mdx -l zh-CN    # language (affects font)
```

### Programmatic

```ts
import { basicRenderer } from "@mdx-cv/core"
import { createWriteStream } from "node:fs"
import { pipeline } from "node:stream/promises"

const mdx = `
# John Doe
Software Engineer

## Experience
- Company A (2020–2024)
`

const stream = await basicRenderer(mdx, new URL("file:///path/to/resume.mdx"))
await pipeline(stream, createWriteStream("resume.pdf"))
```

## Tech Stack

- [MDX](https://mdxjs.com/) v3 — Markdown + JSX
- [React PDF](https://react-pdf.org/) v4 — PDF generation
- [PostCSS](https://postcss.org/) — CSS processing
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Biome](https://biomejs.dev/) — Linting & formatting

## License

MIT
