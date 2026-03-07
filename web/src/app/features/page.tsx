"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Activity,
  Target,
  Tags,
  FileText,
  Monitor,
  Wifi,
  Download,
} from "lucide-react";
import { Navigation, Footer } from "@/components/landing";

const features = [
  {
    icon: BarChart3,
    title: "GitHub-Style Heatmap",
    description:
      "Visualize your entire year of productivity with the familiar contribution graph aesthetic. Each cell represents a day, colored by activity intensity. Spot trends, identify burnout risk, and celebrate streaks — all at a glance.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    visual: (
      <div className="flex gap-[2px]">
        {Array.from({ length: 20 }, (_, col) => (
          <div key={col} className="flex flex-col gap-[2px]">
            {Array.from({ length: 7 }, (_, row) => {
              const intensity = Math.sin(col * 0.5 + row * 0.3) * 0.5 + 0.5;
              const bg =
                intensity > 0.8
                  ? "bg-emerald-400"
                  : intensity > 0.6
                    ? "bg-emerald-600"
                    : intensity > 0.4
                      ? "bg-emerald-700"
                      : intensity > 0.2
                        ? "bg-emerald-900/60"
                        : "bg-zinc-800/60";
              return <div key={row} className={`h-3 w-3 rounded-sm ${bg}`} />;
            })}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Activity,
    title: "Real-Time Tracking",
    description:
      "WebSocket-powered live updates show your current activity the moment it happens. Sub-50ms latency means your dashboard is always in sync. See which app you're using right now with a persistent live indicator.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
          />
          <span className="text-sm text-emerald-400">Live — VS Code</span>
        </div>
        {["Chrome — 2m ago", "Terminal — 8m ago", "Figma — 15m ago"].map((item) => (
          <div key={item} className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="h-2 w-2 rounded-full bg-zinc-700" />
            {item}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Target,
    title: "Goals & Targets",
    description:
      "Set daily, weekly, or custom productivity targets. Track progress with visual indicators that update in real-time. Get notified when you hit your goals or when you're falling behind.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    visual: (
      <div className="space-y-3">
        {[
          { label: "Daily Coding", progress: 85, color: "bg-emerald-500" },
          { label: "Weekly Focus", progress: 62, color: "bg-blue-500" },
          { label: "Monthly Target", progress: 78, color: "bg-purple-500" },
        ].map((goal) => (
          <div key={goal.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">{goal.label}</span>
              <span className="text-zinc-500">{goal.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${goal.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className={`h-full rounded-full ${goal.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Tags,
    title: "Smart Categories",
    description:
      "Define regex-based rules that automatically categorize your apps, websites, and files. Create custom categories like Development, Design, or Communication. See exactly how you split your time.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    visual: (
      <div className="space-y-2">
        {[
          { name: "Development", pattern: "/vscode|terminal|github/i", color: "bg-emerald-500/20 text-emerald-400" },
          { name: "Design", pattern: "/figma|sketch/i", color: "bg-purple-500/20 text-purple-400" },
          { name: "Communication", pattern: "/slack|discord|teams/i", color: "bg-blue-500/20 text-blue-400" },
        ].map((cat) => (
          <div key={cat.name} className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${cat.color}`}>{cat.name}</span>
            <code className="text-[10px] text-zinc-600">{cat.pattern}</code>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: FileText,
    title: "Reports & Export",
    description:
      "Generate weekly and monthly productivity reports with detailed breakdowns by app, category, and project. Export your data as JSON or CSV for further analysis in your favorite tools.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    visual: (
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-zinc-800/50 p-2 text-center">
            <div className="text-lg font-bold text-white">42.5h</div>
            <div className="text-[10px] text-zinc-500">This Week</div>
          </div>
          <div className="flex-1 rounded-lg bg-zinc-800/50 p-2 text-center">
            <div className="text-lg font-bold text-white">168h</div>
            <div className="text-[10px] text-zinc-500">This Month</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {["JSON", "CSV"].map((fmt) => (
            <div key={fmt} className="rounded-md bg-zinc-700/50 px-2 py-1 text-[10px] font-medium text-zinc-400">
              Export {fmt}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Monitor,
    title: "Cross-Platform Agents",
    description:
      "Desktop agents for Windows, macOS, and Linux. Browser extensions for Chrome and Edge. VS Code extension for coding activity. All agents send heartbeats to a single unified backend.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    visual: (
      <div className="grid grid-cols-3 gap-2">
        {["Windows", "macOS", "Linux", "Chrome", "Edge", "VS Code"].map((platform) => (
          <div key={platform} className="rounded-lg bg-zinc-800/50 px-2 py-1.5 text-center text-[10px] font-medium text-zinc-400">
            {platform}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Wifi,
    title: "WebSocket Updates",
    description:
      "Real-time bidirectional communication between your agents and dashboard. No polling, no delays. Events appear on your dashboard the instant they're captured.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    borderColor: "border-green-500/30",
    visual: (
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-2 w-2 rounded-full bg-green-500"
        />
        <div className="flex-1 overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-0.5 w-1/3 rounded-full bg-gradient-to-r from-transparent via-green-500 to-transparent"
          />
        </div>
        <div className="h-2 w-2 rounded-full bg-green-500/50" />
      </div>
    ),
  },
  {
    icon: Download,
    title: "Data Import & Export",
    description:
      "Import activity data from other tools or export everything for backup. Full JSON and CSV support with filtering by date range, device, and category.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    visual: (
      <div className="flex items-center justify-center gap-4">
        <div className="rounded-lg bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-400">
          Import
        </div>
        <div className="text-zinc-600">{"<->"}</div>
        <div className="rounded-lg bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-400">
          Export
        </div>
      </div>
    ),
  },
];

export default function FeaturesPage() {
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
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                Feature Overview
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Everything You Need to
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  Understand Your Work
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
                From automatic activity capture to detailed reports, ProdHub gives
                you complete visibility into how you spend your time.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Feature sections */}
        <section className="relative pb-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="space-y-24">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
                    idx % 2 === 1 ? "lg:direction-rtl" : ""
                  }`}
                >
                  <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} border ${feature.borderColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                      {feature.title}
                    </h2>
                    <p className="text-lg leading-relaxed text-zinc-400">
                      {feature.description}
                    </p>
                  </div>

                  <div className={idx % 2 === 1 ? "lg:order-1" : ""}>
                    <div className={`rounded-2xl border ${feature.borderColor} bg-zinc-900/60 p-8 backdrop-blur-sm`}>
                      {feature.visual}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
                Ready to see where your time goes?
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Start tracking in under 2 minutes. Free and open source.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500"
                >
                  Get Started Free
                </a>
                <a
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3.5 text-base font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
                >
                  See How It Works
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
