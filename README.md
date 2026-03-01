# 10 PRINT SVG Generator

[An implementation][10print] of the [classic Commodore 64 BASIC
algorithm][10print-original].

![Screenshot of 10 PRINT SVG Generator](./screencast.gif)

[10print]: https://10print.xyz/
[10print-original]: https://10print.org/

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

- Interactive Controls: Adjust grid size and line thickness
- Custom Colours: Set your own colour scheme for forward and backward diagonals
- Persistent Settings: Preferences are saved between sessions

## Add as a background on any webpage

The joy of 10 PRINT can be experienced on any webpage. Simply add

```html
<script type="module" src="https://10print.xyz/background-body.js" />
```

...inside the `<head>`, and we will set a background on your `<body>` element.

Other elements can be given a background too, and custom parameters used, like:

```html
<script type="module">
  import { TENPRINT } from "https://10print.xyz/background-element.js";

  const svg = document.getElementById("svg");

  if (svg === null) {
    throw new Error("Couldn't find rotato");
  }

  TENPRINT(svg, {
    firstColour: "#E7AF18",
    secondColour: "#ECBF46",
  });
</script>
```

This will set the background of the element with id `svg` to a 10 PRINT SVG with
the given colours. See [the demo][the demo] for a live example and [the code][code].

Adjust the colours to your heart's content on [the website][10print], and click
the "copy" button to copy a code snippet for the current parameters to your
clipboard.

[code]: ./demo.html
[the demo]: https://10print.xyz/demo

## Getting Started

### Prerequisites

_See <./package.json> for canonical dependency requirements._

- [Node.js]
- [pnpm][pnpm] package manager

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

4. Open your browser to the URL shown in the terminal (typically
   `http://localhost:8788`)

## Deployment

The project is configured for Cloudflare Workers with static assets:

```bash
pnpm run deploy
```

If you use Cloudflare Workers Builds, enable non-production branch builds to get
preview deployments for pull requests/branches, and keep `preview_urls` enabled
in `wrangler.jsonc`.

## Technology

Built with 2025's favourite web technologies:

- [Cloudflare Workers]
- [Radix UI]
- [React]
- [Tailwind CSS]
- [TypeScript]
- [Vite]

[Cloudflare Workers]: https://workers.cloudflare.com/
[Radix UI]: https://www.radix-ui.com/
[React]: https://react.dev/
[Tailwind CSS]: https://tailwindcss.com/
[TypeScript]: https://www.typescriptlang.org/
[Vite]: https://vitejs.dev/

## Licence

This project is available as open source under the terms of the AGPL-3.0.

## Acknowledgements

- Inspired by the book [10 PRINT CHR$(205.5+RND(1)); : GOTO
  10][10print-original]
- Built by [`laney`]

[`laney`]: https://orangesquash.org.uk/~laney
