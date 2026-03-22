# FetchP2P - Secure P2P File Transfer

![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-orange.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-iceit-yellow?logo=buy-me-a-coffee)](https://buymeacoffee.com/iceit)

A privacy-focused, peer-to-peer file transfer utility built with Next.js, WebRTC, and a custom WebSocket signaling server. Files are streamed directly between browsers with zero server-side storage.


## Project Structure

```text
public/           # Public Assets (Images, sw.js, etc.)
signaling/        # Server-side scripts (Signaling Server)
src/
├── app/          # Next.js App Router (Routing Wrapper)
├── views/        # Core UI Pages (Home, Send, Receive)
├── components/   # Reusable UI & Atomic Components
├── lib/          # Centralized Shared Utilities
└── context/      # Global State / File Context
```



###  Large File Streaming (sw.js)
Unlike many web-based transfer tools, FetchP2P does not buffer files in RAM. We use a **Service Worker (`sw.js`)** to intercept incoming data chunks and stream them directly to your disk. This allows for:
- **Unlimited File Sizes:** Transfer 100GB+ files without crashing your browser tab.
- **Low Memory Footprint:** The app typically uses less than 50MB of RAM, regardless of the file size being transferred.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file:
```bash
NEXT_PUBLIC_PEER_HOST=localhost
NEXT_PUBLIC_PEER_PORT=9000
NEXT_PUBLIC_PEER_SECURE=false
NEXT_PUBLIC_PEER_PATH=/
```

### 3. Run the Signaling Server
```bash
npm run signaling
```

### 4. Run the App
```bash
npm run dev
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

Distributed under the **GPL 3.0 License**. See [LICENSE](./LICENSE) for more information.
