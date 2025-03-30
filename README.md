# 10 PRINT SVG Generator

[An implementation of the classic Commodore 64 BASIC algorithm][10print].

![Screenshot of 10 PRINT SVG Generator](./screencast.gif)

[10print]: https://10print.org/

## About

The original "10 PRINT" is a one-line BASIC program for the Commodore 64:

```basic
10 PRINT CHR$(205.5+RND(1)); : GOTO 10
```

This simple code generates a mesmerising maze-like pattern of diagonal lines by
randomly choosing between "\" and "/" characters. This web app is an
implementation of the algorithm, generating an SVG for modern browsers, and
allowing customisation of various parameters.

## Features

- **Interactive Controls**: Adjust grid size and line thickness
- **Custom Colours**: Set your own colour scheme for forward and backward diagonals
- **Persistent Settings**: Preferences are saved between sessions

## Getting Started

### Prerequisites

- [Node.js] (v18 or newer)
- [pnpm][pnpm] package manager (v9 or newer)

[Node.js]: https://nodejs.org/
[pnpm]: https://pnpm.io/

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/iainlane/10print.git
   cd 10print
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Start the development server
   ```bash
   pnpm run dev
   ```

4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Deployment

The project is set up to deploy to Cloudflare Pages on each commit:

```bash
pnpm run deploy
```

## Technology

Built with 2025's favourite web technologies:

- [Cloudflare Pages]
- [Radix UI]
- [React]
- [Tailwind CSS]
- [TypeScript]
- [Vite]

[Cloudflare Pages]: https://pages.cloudflare.com/
[Radix UI]: https://www.radix-ui.com/
[React]: https://react.dev/
[Tailwind CSS]: https://tailwindcss.com/
[TypeScript]: https://www.typescriptlang.org/
[Vite]: https://vitejs.dev/

## Licence

This project is available as open source under the terms of the AGPL-3.0.

## Acknowledgements

- Inspired by the book [10 PRINT CHR$(205.5+RND(1)); : GOTO 10](https://10print.org/)
- Built by [`laney`](https://orangesquash.org.uk/~laney)
