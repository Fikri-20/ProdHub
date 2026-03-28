# ProdHub

[![CI](https://github.com/anomaly/prodhub/actions/workflows/ci.yml/badge.svg)](https://github.com/anomaly/prodhub/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/anomaly/prodhub?include_prereleases&label=latest)](https://github.com/anomaly/prodhub/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Package Manager](https://img.shields.io/badge/pnpm-10.30.1-orange?logo=pnpm)](https://pnpm.io/)

> **A privacy-first, self-hosted, open-source activity tracker** with a GitHub-style heatmap dashboard. Your data stays on your machine — zero cloud dependency, zero telemetry.

<p align="center">
  <a href="https://github.com/anomaly/prodhub/releases/latest">
    <img src="https://img.shields.io/github/v/release/anomaly/prodhub?color=10b981&label=Download%20v1.0.0" />
  </a>
  &nbsp;
  <a href="https://github.com/anomaly/prodhub#-quick-start">
    <img src="https://img.shields.io/badge/Get%20Started-10b981" />
  </a>
  &nbsp;
  <a href="https://github.com/anomaly/prodhub/discussions">
    <img src="https://img.shields.io/badge/Ask%20a%20Question-10b981" />
  </a>
</p>

---

## ✨ Features

| Component | What it tracks |
|---|---|
| **Desktop Agent** | Active window, app switching, idle detection |
| **Browser Extension** | Active tab URL, domain, time per site |
| **VS Code Extension** | File, language, project, coding time |

All tracked activity is stored **locally in SQLite** and visualized in a **GitHub-style heatmap**, timeline, and summary charts.

---

## 📦 Download & Install

### Desktop Agent (recommended)

| Platform | Installer | Status |
|---|---|---|
| **Windows** | [`ProdHub-Agent-Setup-x64.exe`](https://github.com/anomaly/prodhub/releases/latest) | NSIS installer |
| **macOS** | `ProdHub-Agent-x64.dmg` / `ProdHub-Agent-arm64.dmg` | DMG (coming soon) |
| **Linux** | `ProdHub-Agent-x64.AppImage` / `.deb` | AppImage + deb (coming soon) |

After installing, open **ProdHub Agent** from your applications. It runs in the system tray and auto-connects to the dashboard at `http://localhost:3001`.

### One-Command Setup (development)

```bash
git clone https://github.com/anomaly/prodhub.git
cd prodhub
pnpm setup
pnpm start:all
```

Then open `http://localhost:3001` — the API key is auto-generated at `~/.prodhub/agent.json`.

---

## 🚀 Quick Start (Development)

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+

```bash
# 1. Clone the repository
git clone https://github.com/anomaly/prodhub.git
cd prodhub

# 2. Install dependencies, generate Prisma client, run migrations
pnpm setup

# 3. Start API server (port 3000) + dashboard (port 3001)
pnpm start:all
```

Open `http://localhost:3001` to see your dashboard.

### Individual Services

```bash
pnpm dev:server     # API server only, hot reload
pnpm dev:web        # Dashboard only, hot reload
pnpm dev:desktop    # Desktop tray agent
pnpm db:studio      # Prisma Studio (DB GUI)
pnpm test           # Run tests
```

---

## 🔧 Installing Agents

### Desktop Agent (Electron)

```bash
pnpm build:desktop
pnpm start:desktop
```

Or use the pre-built installer from [Releases](https://github.com/anomaly/prodhub/releases/latest).

### Browser Extension (Chrome)

```bash
pnpm build:ext
```

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `browser-extension/dist/`
4. Open the extension popup and enter your API key from `~/.prodhub/agent.json`

### VS Code Extension

```bash
pnpm build:vscode
```

1. Open VS Code
2. Run `Extensions: Install from VSIX...` → select `vscode-extension/dist/prodhub.vsix`
3. Set `"prodhub.apiKey"` in VS Code settings (from `~/.prodhub/agent.json`)

---

## 🔒 Privacy & Security

- **Local-first**: All data is stored in `prisma/prodhub.db` on your machine
- **No telemetry**: Zero analytics, zero phone-home
- **API key auth**: Agents authenticate with SHA-256 hashed keys
- **Default localhost**: API binds to `localhost`. Set `REQUIRE_AUTH=true` for LAN exposure

---

## 🏗️ Architecture

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
                   │   (port 3000) │
                   └───────┬───────┘
                           │
                   ┌───────▼───────┐
                   │    SQLite     │
                   │  (prodhub.db) │
                   └───────┬───────┘
                           │
                   ┌───────▼───────┐
                   │   Dashboard   │
                   │  (port 3001)  │
                   └───────────────┘
```

Everything runs locally. No Docker, no cloud accounts.

---

## 🔧 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | API server port |
| `CORS_ORIGIN` | `localhost:3000,3001` | Allowed CORS origins |
| `REQUIRE_AUTH` | `false` | Require auth on all endpoints |
| `DASHBOARD_PASSWORD` | _(none)_ | Optional dashboard password |

---

## 📚 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Fastify (TypeScript) |
| Database | SQLite (via Prisma) |
| Dashboard | Next.js (App Router) |
| Desktop | Electron |
| Browser | Chrome MV3 Extension |
| Editor | VS Code Extension |
| Validation | Zod |

---

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](./CONTRIBUTING.md) before opening a PR.

- Check [open issues](https://github.com/anomaly/prodhub/issues) for things to work on
- Read our [Code of Conduct](./CODE_OF_CONDUCT.md)
- For security issues, see our [Security Policy](./.github/SECURITY.md)

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.
