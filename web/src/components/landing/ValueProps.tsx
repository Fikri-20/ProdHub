"use client";

import { motion } from "framer-motion";
import { HardDrive, Settings, Code } from "lucide-react";

const features = [
  {
    icon: HardDrive,
    title: "Your Data, Your Machine",
    description:
      "Everything stored in a local SQLite database. No cloud accounts, no third-party servers. Your activity data never leaves your machine.",
    iconBg: "bg-yellow-500/15",
    iconColor: "text-yellow-400",
    glowColor: "shadow-yellow-500/20",
    borderAccent: "group-hover:border-t-yellow-500/50",
  },
  {
    icon: Settings,
    title: "Zero Configuration",
    description:
      "Install and run. The server auto-seeds your user, generates API keys, and agents auto-discover settings. No Docker, no cloud setup required.",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    glowColor: "shadow-purple-500/20",
    borderAccent: "group-hover:border-t-purple-500/50",
  },
  {
    icon: Code,
    title: "Fully Open Source",
    description:
      "MIT licensed. Fork it, extend it, self-host it. Desktop agent, browser extension, VS Code plugin, and dashboard — all included.",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    glowColor: "shadow-emerald-500/20",
    borderAccent: "group-hover:border-t-emerald-500/50",
  },
];

export function ValueProps() {
  return (
    <section id="features" className="relative bg-zinc-950 py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/80 via-zinc-950 to-zinc-950" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need.{" "}
            <span className="text-zinc-500">Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Built for developers who value simplicity and insight.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/80 p-8 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-800/80 ${feature.borderAccent}`}
            >
              <div className="relative">
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.iconBg} shadow-lg ${feature.glowColor}`}
                >
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>

                <h3 className="mb-3 text-xl font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
