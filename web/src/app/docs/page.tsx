"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { BookOpen, Copy, Check, ChevronDown } from "lucide-react";
import { Navigation, Footer } from "@/components/landing";

const sections = [
  { id: "getting-started", title: "Getting Started" },
  { id: "api-reference", title: "API Reference" },
  { id: "configuration", title: "Configuration" },
  { id: "desktop-agent", title: "Desktop Agent" },
  { id: "browser-extension", title: "Browser Extension" },
  { id: "vscode-extension", title: "VS Code Extension" },
];

function CodeBlock({ code, language = "bash", filename }: { code: string; language?: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs font-medium text-zinc-500">
          {filename || language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="text-zinc-300">{code}</code>
      </pre>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <main className="pt-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-12">
            {/* Sidebar - Desktop */}
            <aside className="sticky top-24 hidden h-fit w-56 shrink-0 lg:block">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Sidebar - Mobile dropdown */}
            <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/95 px-4 py-3 text-sm font-medium text-white backdrop-blur-xl"
              >
                {sections.find((s) => s.id === activeSection)?.title || "Navigation"}
                <ChevronDown className={`h-4 w-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
              </button>
              {sidebarOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-zinc-700 bg-zinc-900/95 p-2 backdrop-blur-xl">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pb-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Header */}
                <div className="mb-12">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
                    <BookOpen className="h-4 w-4 text-emerald-500" />
                    Documentation
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    ProdHub Docs
                  </h1>
                  <p className="mt-4 text-lg text-zinc-400">
                    Everything you need to set up, configure, and extend ProdHub.
                  </p>
                </div>

                {/* Getting Started */}
                <section id="getting-started" className="mb-16 scroll-mt-24">
                  <h2 className="mb-6 text-2xl font-bold text-white">
                    Getting Started
                  </h2>
                  <p className="mb-6 text-zinc-400">
                    ProdHub consists of a backend API server, a Next.js dashboard, and
                    platform-specific agents. Here&apos;s how to get everything running locally.
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-white">Prerequisites</h3>
                  <ul className="mb-6 list-inside list-disc space-y-1 text-zinc-400">
                    <li>Node.js 18+ and pnpm 10+</li>
                    <li>Docker (for PostgreSQL)</li>
                    <li>Git</li>
                  </ul>

                  <h3 className="mb-3 text-lg font-semibold text-white">Quick Start</h3>
                  <div className="space-y-4">
                    <CodeBlock
                      filename="Clone & Install"
                      code={`git clone https://github.com/anomaly/prodhub.git
cd prodhub
pnpm install`}
                    />
                    <CodeBlock
                      filename="Start Database"
                      code={`# Start PostgreSQL container
pnpm db:up

# Run migrations
pnpm db:migrate`}
                    />
                    <CodeBlock
                      filename="Start Development"
                      code={`# Start the API server (port 3000)
pnpm dev:server

# In another terminal, start the dashboard (port 3001)
pnpm dev:web`}
                    />
                  </div>
                </section>

                {/* API Reference */}
                <section id="api-reference" className="mb-16 scroll-mt-24">
                  <h2 className="mb-6 text-2xl font-bold text-white">
                    API Reference
                  </h2>
                  <p className="mb-6 text-zinc-400">
                    The ProdHub API runs on Fastify and exposes RESTful endpoints for
                    event ingestion, querying, and management.
                  </p>

                  <div className="space-y-6">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                          POST
                        </span>
                        <code className="text-sm text-white">/api/events/heartbeat</code>
                      </div>
                      <p className="mb-4 text-sm text-zinc-400">
                        Ingest a heartbeat event from any agent. Automatically handles device
                        upsert and session merging.
                      </p>
                      <CodeBlock
                        language="json"
                        code={`{
  "appName": "Visual Studio Code",
  "windowTitle": "index.ts — my-project",
  "deviceId": "my-device"
}`}
                      />
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
                          GET
                        </span>
                        <code className="text-sm text-white">/api/events</code>
                      </div>
                      <p className="mb-4 text-sm text-zinc-400">
                        Query activity events with filters for date range, device, app, and pagination.
                      </p>
                      <CodeBlock
                        language="bash"
                        code={`curl "/api/events?from=2026-01-01&to=2026-01-31&limit=50"`}
                      />
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
                          GET
                        </span>
                        <code className="text-sm text-white">/api/summary</code>
                      </div>
                      <p className="mb-4 text-sm text-zinc-400">
                        Get aggregated duration summaries grouped by app or category.
                      </p>
                      <CodeBlock
                        language="bash"
                        code={`curl "/api/summary?groupBy=app&period=today"`}
                      />
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
                          GET
                        </span>
                        <code className="text-sm text-white">/api/categories</code>
                      </div>
                      <p className="text-sm text-zinc-400">
                        CRUD endpoints for managing categories. Supports GET (list), POST (create),
                        PATCH/:id (update), DELETE/:id (remove).
                      </p>
                    </div>
                  </div>
                </section>

                {/* Configuration */}
                <section id="configuration" className="mb-16 scroll-mt-24">
                  <h2 className="mb-6 text-2xl font-bold text-white">
                    Configuration
                  </h2>
                  <p className="mb-6 text-zinc-400">
                    ProdHub uses environment variables for configuration. Create a{" "}
                    <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm text-emerald-400">.env</code>{" "}
                    file in the project root.
                  </p>

                  <CodeBlock
                    filename=".env"
                    code={`# Database
DATABASE_URL="postgresql://prodhub:prodhub_dev@localhost:5432/prodhub"

# Auth.js
AUTH_SECRET="your-secret-here"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Server
PORT=3000
CORS_ORIGIN="http://localhost:3001"`}
                  />

                  <h3 className="mb-3 mt-8 text-lg font-semibold text-white">Available Commands</h3>
                  <div className="overflow-hidden rounded-xl border border-zinc-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/60">
                          <th className="px-4 py-3 text-left font-semibold text-zinc-300">Command</th>
                          <th className="px-4 py-3 text-left font-semibold text-zinc-300">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {[
                          ["pnpm dev:server", "Run Fastify server in watch mode"],
                          ["pnpm dev:web", "Run Next.js dashboard (port 3001)"],
                          ["pnpm build", "Bundle with tsup (ESM)"],
                          ["pnpm db:up", "Start PostgreSQL container"],
                          ["pnpm db:migrate", "Run Prisma migrations"],
                          ["pnpm db:studio", "Open Prisma Studio GUI"],
                          ["pnpm test", "Run all tests (Vitest)"],
                          ["pnpm build:ext", "Build browser extension"],
                          ["pnpm build:vscode", "Build VS Code extension"],
                        ].map(([cmd, desc]) => (
                          <tr key={cmd} className="hover:bg-zinc-900/40">
                            <td className="px-4 py-2.5">
                              <code className="text-emerald-400">{cmd}</code>
                            </td>
                            <td className="px-4 py-2.5 text-zinc-400">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Desktop Agent */}
                <section id="desktop-agent" className="mb-16 scroll-mt-24">
                  <h2 className="mb-6 text-2xl font-bold text-white">
                    Desktop Agent
                  </h2>
                  <p className="mb-6 text-zinc-400">
                    The Electron-based desktop agent runs as a system tray application. It
                    detects the active window every 5 seconds and sends heartbeats to the
                    ProdHub API.
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-white">Features</h3>
                  <ul className="mb-6 list-inside list-disc space-y-1 text-zinc-400">
                    <li>System tray with status indicator</li>
                    <li>Auto-start on OS login</li>
                    <li>Configurable API URL and API key</li>
                    <li>Pause/resume tracking from tray menu</li>
                    <li>Windows installer (NSIS)</li>
                  </ul>

                  <h3 className="mb-3 text-lg font-semibold text-white">Setup</h3>
                  <CodeBlock
                    code={`# Build the desktop agent
cd desktop-agent
pnpm install
pnpm build

# Or build the Windows installer
pnpm build:installer`}
                  />
                </section>

                {/* Browser Extension */}
                <section id="browser-extension" className="mb-16 scroll-mt-24">
                  <h2 className="mb-6 text-2xl font-bold text-white">
                    Browser Extension
                  </h2>
                  <p className="mb-6 text-zinc-400">
                    Chrome Manifest V3 extension that tracks active tab activity including
                    URL domain, page title, and time spent.
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-white">Features</h3>
                  <ul className="mb-6 list-inside list-disc space-y-1 text-zinc-400">
                    <li>Active tab detection with domain tracking</li>
                    <li>Popup UI with config, status, and daily stats</li>
                    <li>Incognito and idle detection</li>
                    <li>URL-based domain categorization</li>
                    <li>5-minute flush interval</li>
                  </ul>

                  <h3 className="mb-3 text-lg font-semibold text-white">Build & Load</h3>
                  <CodeBlock
                    code={`# Build the extension
pnpm build:ext

# Load in Chrome:
# 1. Go to chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select browser-extension/dist/`}
                  />
                </section>

                {/* VS Code Extension */}
                <section id="vscode-extension" className="mb-16 scroll-mt-24">
                  <h2 className="mb-6 text-2xl font-bold text-white">
                    VS Code Extension
                  </h2>
                  <p className="mb-6 text-zinc-400">
                    Tracks coding activity including the current file, programming language,
                    and project. Sends heartbeats on file switches, typing activity, and
                    periodic flushes.
                  </p>

                  <h3 className="mb-3 text-lg font-semibold text-white">Features</h3>
                  <ul className="mb-6 list-inside list-disc space-y-1 text-zinc-400">
                    <li>File, language, and project tracking</li>
                    <li>Status bar indicator with click-to-toggle</li>
                    <li>Idle detection (5 minute timeout)</li>
                    <li>Periodic flush every 2 minutes</li>
                    <li>Configurable via VS Code settings</li>
                  </ul>

                  <h3 className="mb-3 text-lg font-semibold text-white">Configuration</h3>
                  <CodeBlock
                    filename="settings.json"
                    language="json"
                    code={`{
  "prodhub.apiUrl": "http://localhost:3000",
  "prodhub.apiKey": "pk_live_your_api_key",
  "prodhub.enabled": true
}`}
                  />

                  <h3 className="mb-3 mt-6 text-lg font-semibold text-white">Build</h3>
                  <CodeBlock
                    code={`# Build the VS Code extension
pnpm build:vscode

# The output is at vscode-extension/dist/extension.js`}
                  />
                </section>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
