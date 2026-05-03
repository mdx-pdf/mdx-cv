# @mdx-cv/cli

Command-line tool for generating PDF resumes from MDX files. Powered by [`@mdx-cv/core`](../core/).

## Install

```sh
npm i -g @mdx-cv/cli
```

After install the `mdxcv` binary is available.

## Commands

### `mdxcv render <input>`

Convert an MDX file to PDF.

```sh
mdxcv render resume.mdx
```

| Flag                 | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `-f, --filedebug`    | Write intermediate files (compiled JSX) for debugging |
| `-o, --output <dir>` | Output directory (default: same as input file)        |
| `-l, --lang <tag>`   | BCP 47 language tag. `zh*` selects Noto Sans SC font  |

### `mdxcv init`

Initialize a new MDX CV project. _(placeholder)_

## Development

```sh
pnpm start render assets/basic-resume/resume.mdx

pnpm build      # build dist/
```
