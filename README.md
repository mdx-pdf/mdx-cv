# MDX-CV (WIP)

Generate professional resumes/CVs from MDX files into PDF. Write your resume in Markdown with JSX support, get a styled PDF out.

## Features

- MDX to PDF conversion
- React component-based styling
- Simple CLI interface

## Getting Started

```bash
# Install dependencies
pnpm install

# Convert an MDX file to PDF
cd packages/core
pnpm start path/to/your-resume.mdx
```

The output PDF is generated alongside the input file.

## Project Structure

```
mdx-cv/
├── packages/
│   └── core/
│       ├── src/
│       │   ├── index.tsx          # Entry point: MDX compilation & PDF generation
│       │   └── lib/
│       │       └── MdElementMap.tsx  # MDX element → PDF component mapping
│       └── assets/
│           ├── NotoSansSC-Regular.ttf  # Chinese font
│           └── example.mdx            # Example resume
```

## Writing Your Resume

Create an `.mdx` file using standard Markdown syntax:

```mdx
# Your Name

## Skills

- Skill one
- Skill two

## Experience

**Company Name** — Role
Description of what you did.
```

## Element Mapping

| MDX Element | PDF Rendering |
|-------------|---------------|
| `h1`        | Large bold heading |
| `strong`    | Bold text |
| `p`         | Paragraph |
| `ul` / `li` | Bulleted list |
| `a`         | Clickable link |

## Tech Stack

- [MDX](https://mdxjs.com/) v3 — Markdown + JSX
- [React PDF](https://react-pdf.org/) v4 — PDF generation
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Biome](https://biomejs.dev/) — Linting & formatting

## License

MIT
