# Contributing to FetchP2P

First off, thank you for considering contributing to FetchP2P!

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

- **Check if the bug is already reported** by searching the GitHub issues.
- If you can't find an open issue addressing the problem, **open a new one**.
- Use a clear and descriptive title.
- Describe the exact steps which reproduce the problem in as many details as possible.

### Suggesting Enhancements

- **Check if the enhancement has already been suggested**.
- Open a new issue if it hasn't.
- Provide a clear and detailed description of the proposed enhancement.

### Pull Requests

1.  **Fork the repo** and create your branch from `main`.
2.  If you've added code that should be tested, **add tests**.
3.  Ensure the test suite passes.
4.  Make sure your code lints (`npm run lint`).
5.  **Issue a Pull Request** with a descriptive title and detailed description of your changes.

## Development Setup

1.  Clone your fork: `git clone https://github.com/YOUR_USERNAME/fetch-p2p.git`
2.  Install dependencies: `npm install`
3.  Configure `.env.local`:
    ```bash
    NEXT_PUBLIC_PEER_HOST=localhost
    NEXT_PUBLIC_PEER_PORT=9000
    NEXT_PUBLIC_PEER_SECURE=false
    NEXT_PUBLIC_PEER_PATH=/
    ```
4.  Start signaling server: `npm run signaling` (ensure this script is added in your `package.json`)
5.  Start development server: `npm run dev`

## Coding Standards

- We use **TypeScript** for everything.
- Follow the existing project structure:
    - Atomic UI components in `src/components/ui`.
    - Page-level logic in `src/views`.
    - Shared utilities in `src/lib`.
- Use functional components with hooks.
- Prefix unused variables with `_` to satisfy linting.

## License

By contributing, you agree that your contributions will be licensed under its **AGPL 3.0 License**.
