# ProdHub

A privacy-first, self-hosted, open-source activity tracker with a GitHub-style heatmap dashboard. Your data stays on your machine.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run database migrations (creates SQLite file)
pnpm db:migrate

# Start API server
pnpm dev:server

# In another terminal: start dashboard
pnpm dev:web
```

That's it. Open `http://localhost:3001` to see your dashboard. No Docker, no cloud accounts, no configuration needed.

## What Happens on First Start

1. The server creates a SQLite database (`prisma/prodhub.db`)
2. A default user (`admin@localhost`) is auto-created
3. An API key is generated and written to `~/.prodhub/agent.json`
4. Desktop/browser agents auto-read this config and start sending heartbeats

## Agent Setup

### Desktop Agent (Electron)

```bash
pnpm dev:desktop
```

The desktop agent reads `~/.prodhub/agent.json` automatically — no manual API key setup needed.

### Browser Extension

1. Build: `pnpm build:ext`
2. Load `browser-extension/dist/` as unpacked extension in Chrome
3. Enter API key from `~/.prodhub/agent.json` in the popup

### VS Code Extension

1. Build: `pnpm build:vscode`
2. Install the `.vsix` in VS Code
3. Set the API key from `~/.prodhub/agent.json` in VS Code settings

## Development

```bash
pnpm dev              # Run tracker in watch mode
pnpm dev:server       # Run API server in watch mode (port 3000)
pnpm dev:web          # Run Next.js dashboard (port 3001)
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm db:migrate       # Run Prisma migrations
pnpm db:studio        # Open Prisma Studio GUI
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Desktop   │     │   Browser   │     │   VS Code   │
│   Agent     │     │  Extension  │     │  Extension  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                   ┌───────────────┐
                   │   Fastify API │
                   │  (port 3000)  │
                   └───────┬───────┘
                           │
                   ┌───────▼───────┐
                   │    SQLite     │
                   │ (prodhub.db)  │
                   └───────┬───────┘
                           │
                   ┌───────▼───────┐
                   │   Dashboard   │
                   │  (port 3001)  │
                   └───────────────┘
```

Everything runs locally on your machine.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | API server port |
| `CORS_ORIGIN` | No | localhost:3000,3001 | Allowed origins |
| `REQUIRE_AUTH` | No | false | Require auth on all endpoints (for LAN exposure) |
| `DASHBOARD_PASSWORD` | No | - | Optional password to protect the dashboard |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Fastify (TypeScript) |
| Database | SQLite (via Prisma) |
| Dashboard | Next.js (App Router) |
| Desktop | Electron |
| Browser | Chrome MV3 Extension |
| Editor | VS Code Extension |
| Validation | Zod |

## Contributing

Contributions are welcome! See the issues on GitHub.

## License

MIT
