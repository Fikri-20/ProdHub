"use client";

import { motion } from "framer-motion";
import { Download, Monitor, Globe, Code2, Terminal, Github, ArrowRight } from "lucide-react";
import { Navigation, Footer } from "@/components/landing";
import Link from "next/link";

const platforms = [
  {
    icon: Monitor,
    name: "Desktop Agent",
    badge: "Recommended",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    description: "Track active windows, app switching, and idle time. Runs in the system tray.",
    download: {
      windows: { label: "Windows (x64)", href: "https://github.com/anomaly/prodhub/releases/latest" },
      macos: { label: "macOS (x64 + ARM)", href: "https://github.com/anomaly/prodhub/releases/latest", soon: true },
      linux: { label: "Linux (AppImage)", href: "https://github.com/anomaly/prodhub/releases/latest", soon: true },
    },
    installSteps: [
      "Download the installer for your platform",
      "Run the installer (.exe / .dmg / .AppImage)",
      "Open ProdHub Agent from your applications",
      "It runs in the system tray — click to see status",
    ],
  },
  {
    icon: Globe,
    name: "Browser Extension",
    badge: "Optional",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    description: "Track active tab URLs, domain-level categorization, and daily stats in Chrome.",
    download: null,
    installSteps: [
      "Run `pnpm build:ext` from the project root",
      "Open chrome://extensions",
      "Enable Developer mode (top right)",
      "Click 'Load unpacked' → select `browser-extension/dist/`",
      "Click the extension icon → enter your API key",
    ],
  },
  {
    icon: Code2,
    name: "VS Code Extension",
    badge: "Optional",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    description: "Track file changes, language, project context, and coding time directly in your editor.",
    download: null,
    installSteps: [
      "Run `pnpm build:vscode` from the project root",
      "In VS Code: Extensions → '...' menu → 'Install from VSIX'",
      "Select `vscode-extension/dist/prodhub.vsix`",
      "Open Command Palette → 'ProdHub: Set API Key'",
      "Paste your API key from `~/.prodhub/agent.json`",
    ],
  },
];

const devSetup = {
  title: "Development Setup",
  subtitle: "Clone, install, and run in under 2 minutes",
  terminalSteps: [
    { label: "Clone the repo", command: "git clone https://github.com/anomaly/prodhub.git && cd prodhub" },
    { label: "Install dependencies", command: "pnpm setup" },
    { label: "Start API + Dashboard", command: "pnpm start:all" },
    { label: "Open dashboard", command: "open http://localhost:3001" },
  ],
  note: "Requires Node.js 20+ and pnpm 10+. The setup command installs deps, generates the Prisma client, and runs migrations automatically.",
};

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[100px]" />

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
                <Download className="h-4 w-4 text-emerald-500" />
                Install
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Get ProdHub
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  Up and Running
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
                Install the desktop agent for automatic tracking, or add browser and editor extensions for deeper insight.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Platform Installers */}
        <section className="relative pb-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {platforms.map((platform, idx) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/80"
                >
                  <div className="p-8">
                    <div className="mb-6 flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800`}>
                        <platform.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${platform.badgeColor}`}>
                        {platform.badge}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-white">{platform.name}</h3>
                    <p className="mb-6 text-sm leading-relaxed text-zinc-400">{platform.description}</p>

                    {platform.download && (
                      <div className="mb-6 grid grid-cols-3 gap-2">
                        <a
                          href={platform.download.windows.href}
                          className="flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/50 hover:bg-zinc-800"
                        >
                          🪟 {platform.download.windows.label}
                        </a>
                        <button
                          disabled={platform.download.macos?.soon}
                          className="flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-2 text-xs font-medium text-zinc-500 cursor-not-allowed"
                          title="Coming soon"
                        >
                          🍎 {platform.download.macos?.soon ? "Soon" : platform.download.macos?.label}
                        </button>
                        <button
                          disabled={platform.download.linux?.soon}
                          className="flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-2 text-xs font-medium text-zinc-500 cursor-not-allowed"
                          title="Coming soon"
                        >
                          🐧 {platform.download.linux?.soon ? "Soon" : platform.download.linux?.label}
                        </button>
                      </div>
                    )}

                    <ol className="space-y-2">
                      {platform.installSteps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-zinc-400">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-500">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer Setup */}
        <section className="relative border-t border-zinc-800 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
                <Terminal className="h-4 w-4 text-emerald-500" />
                Development
              </div>
              <h2 className="text-3xl font-bold text-white">{devSetup.title}</h2>
              <p className="mt-4 text-lg text-zinc-400">{devSetup.subtitle}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/80"
            >
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-3 text-xs font-medium text-zinc-400">Terminal</span>
              </div>
              <div className="p-6">
                <ol className="space-y-4">
                  {devSetup.terminalSteps.map((step, i) => (
                    <li key={step.label} className="flex items-center gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-500">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm text-zinc-400">{step.label}</span>
                        <div className="mt-1 overflow-x-auto rounded-lg bg-zinc-950 px-4 py-2 font-mono text-sm text-emerald-400">
                          {step.command}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>

            <p className="text-center text-sm text-zinc-500">{devSetup.note}</p>

            <div className="mt-8 flex justify-center">
              <a
                href="https://github.com/anomaly/prodhub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-base font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
              >
                <Github className="h-5 w-5" />
                View on GitHub for more options
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* After Install */}
        <section className="relative border-t border-zinc-800 py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white">What happens next?</h2>
              <p className="mt-4 text-lg text-zinc-400">
                On first run, the server creates a SQLite database, generates an API key, and writes it to <code className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-sm text-emerald-400">~/.prodhub/agent.json</code>. Agents auto-read this — no manual config needed.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500"
                >
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3.5 text-base font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
                >
                  How It Works
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
