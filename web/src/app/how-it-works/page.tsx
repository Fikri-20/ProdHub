"use client";

import { motion } from "framer-motion";
import {
  Monitor,
  Server,
  LayoutDashboard,
  Globe,
  Code2,
  Braces,
} from "lucide-react";
import { Navigation, Footer } from "@/components/landing";

const heartbeatPayload = `{
  "appName": "Visual Studio Code",
  "windowTitle": "server.ts — ProdHub",
  "deviceId": "macbook-pro-m2",
  "metadata": {
    "file": "src/server.ts",
    "language": "typescript",
    "project": "prodhub"
  }
}`;

const curlExample = `# Send a heartbeat
curl -X POST https://api.prodhub.dev/api/events/heartbeat \\
  -H "Authorization: Bearer pk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '${heartbeatPayload.replace(/\n/g, "\\n").replace(/'/g, "\\'")}'

# Query events
curl https://api.prodhub.dev/api/events?groupBy=app&period=today \\
  -H "Authorization: Bearer pk_live_..."

# Get summary
curl https://api.prodhub.dev/api/summary?groupBy=category \\
  -H "Authorization: Bearer pk_live_..."`;

const techStack = [
  { name: "Fastify", category: "Backend", color: "text-emerald-400" },
  { name: "PostgreSQL", category: "Database", color: "text-blue-400" },
  { name: "Prisma", category: "ORM", color: "text-purple-400" },
  { name: "Next.js", category: "Frontend", color: "text-white" },
  { name: "Auth.js", category: "Auth", color: "text-orange-400" },
  { name: "Electron", category: "Desktop", color: "text-cyan-400" },
  { name: "Chrome MV3", category: "Extension", color: "text-green-400" },
  { name: "VS Code API", category: "Editor", color: "text-blue-500" },
  { name: "WebSocket", category: "Real-time", color: "text-yellow-400" },
  { name: "Zod", category: "Validation", color: "text-rose-400" },
  { name: "TypeScript", category: "Language", color: "text-blue-400" },
  { name: "Docker", category: "Deploy", color: "text-sky-400" },
];

const steps = [
  {
    icon: Monitor,
    step: "01",
    title: "Capture",
    subtitle: "Activity detection across all platforms",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description:
      "Lightweight agents run silently on your devices, detecting active windows, browser tabs, and editor files. Each agent sends heartbeat events to the ProdHub API every 5 seconds.",
    sources: [
      { name: "Desktop Agent", desc: "Electron tray app — Windows, macOS, Linux" },
      { name: "Browser Extension", desc: "Chrome MV3 — tracks active tab, domain, title" },
      { name: "VS Code Extension", desc: "Tracks file, language, project, and typing activity" },
    ],
  },
  {
    icon: Server,
    step: "02",
    title: "Process",
    subtitle: "Instant categorization and storage",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description:
      "The Fastify backend processes each heartbeat in under 50ms. Events are deduplicated, merged into activity sessions, and automatically categorized using regex rules. Everything is stored in PostgreSQL via Prisma.",
    sources: [
      { name: "Heartbeat Ingestion", desc: "POST /api/events/heartbeat — dedup + merge" },
      { name: "Categorization Engine", desc: "Regex-based rules match app names and titles" },
      { name: "WebSocket Broadcast", desc: "Push events to connected dashboard clients" },
    ],
  },
  {
    icon: LayoutDashboard,
    step: "03",
    title: "Visualize",
    subtitle: "Insights at a glance",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description:
      "The Next.js dashboard renders your data as a GitHub-style heatmap, timeline view, category breakdown, and goal tracker. Real-time WebSocket updates mean your dashboard is always live.",
    sources: [
      { name: "Heatmap View", desc: "365-day contribution graph with intensity levels" },
      { name: "Timeline View", desc: "Gantt-style chronological event display" },
      { name: "Reports", desc: "Weekly and monthly summaries with export" },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />
          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
                <Braces className="h-4 w-4 text-emerald-500" />
                Architecture Deep Dive
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                From Keystroke to Insight
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  in Milliseconds
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
                See exactly how ProdHub captures, processes, and visualizes your
                activity data across every platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Expanded steps */}
        <section className="relative pb-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="space-y-24">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-8 flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${step.borderColor} ${step.bg}`}>
                      <step.icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-bold tracking-widest ${step.color} opacity-60`}>
                        STEP {step.step}
                      </div>
                      <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                      <p className="text-sm text-zinc-500">{step.subtitle}</p>
                    </div>
                  </div>

                  <p className="mb-8 max-w-3xl text-lg leading-relaxed text-zinc-400">
                    {step.description}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {step.sources.map((source) => (
                      <div
                        key={source.name}
                        className={`rounded-xl border ${step.borderColor} bg-zinc-900/60 p-5 backdrop-blur-sm`}
                      >
                        <h4 className="mb-1 text-sm font-semibold text-white">
                          {source.name}
                        </h4>
                        <p className="text-xs leading-relaxed text-zinc-500">
                          {source.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="mt-12 flex justify-center">
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50"
                      >
                        <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Heartbeat payload */}
        <section className="relative border-t border-zinc-800 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl font-bold text-white">
                The Heartbeat Event
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Every activity is captured as a simple JSON heartbeat
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/80"
            >
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <Code2 className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-400">heartbeat.json</span>
              </div>
              <pre className="overflow-x-auto p-6 text-sm leading-relaxed">
                <code className="text-emerald-400">{heartbeatPayload}</code>
              </pre>
            </motion.div>
          </div>
        </section>

        {/* Tech stack */}
        <section className="relative py-24">
          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl font-bold text-white">Tech Stack</h2>
              <p className="mt-4 text-lg text-zinc-400">
                Built with modern, production-grade tools
              </p>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
              {techStack.map((tech, idx) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center transition-colors hover:border-zinc-700"
                >
                  <div className={`text-sm font-semibold ${tech.color}`}>
                    {tech.name}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
                    {tech.category}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* API examples */}
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
                <Globe className="h-4 w-4 text-emerald-500" />
                REST API
              </div>
              <h2 className="text-3xl font-bold text-white">
                Simple API, Powerful Data
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Everything accessible via clean REST endpoints
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/80"
            >
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
                <span className="text-xs font-medium text-zinc-400">Terminal</span>
              </div>
              <pre className="overflow-x-auto p-6 text-sm leading-relaxed">
                <code className="text-zinc-300">{curlExample}</code>
              </pre>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative border-t border-zinc-800 py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                See it in action
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Deploy ProdHub and start capturing your first heartbeat.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500"
                >
                  Get Started Free
                </a>
                <a
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3.5 text-base font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
                >
                  Read the Docs
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
