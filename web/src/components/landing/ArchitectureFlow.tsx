"use client";

import { motion } from "framer-motion";
import { Monitor, Server, LayoutDashboard } from "lucide-react";

const steps = [
  {
    icon: Monitor,
    step: "01",
    title: "Capture",
    description: "Desktop, Browser & VS Code agents detect active windows, tabs, and files",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    borderColor: "border-blue-500/30",
  },
  {
    icon: Server,
    step: "02",
    title: "Process",
    description: "Local Fastify API + SQLite processes heartbeats and categorizes activity on your machine",
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    borderColor: "border-purple-500/30",
  },
  {
    icon: LayoutDashboard,
    step: "03",
    title: "Visualize",
    description: "Next.js dashboard with heatmaps, goals, and real-time WebSocket updates",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    borderColor: "border-emerald-500/30",
  },
];

function AnimatedConnector() {
  return (
    <div className="relative hidden h-0.5 w-24 overflow-hidden md:block">
      <div className="absolute inset-0 border-t-2 border-dashed border-zinc-700" />
      {/* Primary pulse */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
        style={{ height: 2, top: -1 }}
      />
      {/* Trailing pulse */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear",
          delay: 0.8,
        }}
        className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
        style={{ height: 2, top: -1 }}
      />
      {/* Traveling dot */}
      <motion.div
        animate={{ x: ["-10px", "100px"] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          delay: 0.3,
        }}
        className="absolute top-[-2.5px] h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
      />
    </div>
  );
}

export function ArchitectureFlow() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-zinc-950 py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950 to-zinc-950" />

      {/* Parallax background dots */}
      <motion.div
        initial={{ y: 0 }}
        whileInView={{ y: -30 }}
        viewport={{ once: false }}
        transition={{ duration: 1 }}
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Everything runs locally on your machine — no cloud required
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center md:gap-0">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex items-center gap-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex w-64 flex-col items-center"
              >
                {/* Step number */}
                <div className={`mb-4 text-sm font-bold tracking-widest ${step.color} opacity-60`}>
                  {step.step}
                </div>

                {/* Icon with glassmorphism */}
                <div className="relative mb-5">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative rounded-2xl border ${step.borderColor} ${step.glow} bg-zinc-900/40 p-7 backdrop-blur-xl`}
                  >
                    <step.icon className={`h-10 w-10 ${step.color}`} />
                  </motion.div>
                </div>

                <h3 className="mb-2 text-center text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-center text-sm leading-relaxed text-zinc-400">
                  {step.description}
                </p>
              </motion.div>

              {idx < steps.length - 1 && <AnimatedConnector />}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 flex justify-center"
        >
          <div className="flex items-center gap-6 rounded-2xl border border-zinc-700/60 bg-zinc-900/40 px-8 py-6 backdrop-blur-xl">
            <div className="flex -space-x-2">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-900 ${step.bg}`}
                >
                  <step.icon className={`h-5 w-5 ${step.color}`} />
                </div>
              ))}
            </div>
            <div className="h-8 w-px bg-zinc-700" />
            <div>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-emerald-500"
                />
                <span className="text-sm font-medium text-white">
                  WebSocket Connected
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Real-time updates under 50ms latency
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
