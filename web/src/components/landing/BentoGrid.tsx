"use client";

import { motion, useInView } from "framer-motion";
import { BarChart3, Target, Tags, FileText, Activity } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";

function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.round(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function MiniHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const cells = useMemo(() => {
    const rng = seededRandom(99);
    const rows = 7;
    const cols = 15;
    return Array.from({ length: cols }, () =>
      Array.from({ length: rows }, () => {
        const intensity = rng();
        if (intensity > 0.8) return "bg-emerald-400";
        if (intensity > 0.6) return "bg-emerald-600";
        if (intensity > 0.4) return "bg-emerald-700/80";
        if (intensity > 0.2) return "bg-emerald-900/50";
        return "bg-zinc-800/60";
      })
    );
  }, []);

  return (
    <div ref={ref} className="flex gap-1">
      {cells.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-1">
          {col.map((bgClass, rowIdx) => (
            <motion.div
              key={rowIdx}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.3,
                delay: colIdx * 0.05 + rowIdx * 0.02,
                ease: "easeOut",
              }}
              className={`h-3.5 w-3.5 rounded-sm ${bgClass}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface BentoItem {
  title: string;
  description: string;
  icon: typeof BarChart3;
  size: string;
  content: React.ReactNode;
  accentColor: string;
  hoverGlow: string;
}

const bentoItems: BentoItem[] = [
  {
    title: "GitHub-Style Heatmap",
    description:
      "Visualize your productivity over 365 days with the familiar contribution graph aesthetic.",
    icon: BarChart3,
    size: "large",
    content: <MiniHeatmap />,
    accentColor: "border-t-emerald-500/60",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]",
  },
  {
    title: "Real-Time Status",
    description: "Live WebSocket connection shows current activity instantly.",
    icon: Activity,
    size: "medium",
    content: (
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
        />
        <div className="text-sm font-medium text-emerald-400">
          Tracking Active
        </div>
      </div>
    ),
    accentColor: "border-t-blue-500/60",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]",
  },
  {
    title: "Daily Goals",
    description: "Set targets and track progress with visual indicators.",
    icon: Target,
    size: "small",
    content: (
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Daily Goal</span>
          <span className="text-emerald-400">8h / 10h</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "80%" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full rounded-full bg-emerald-500"
          />
        </div>
      </div>
    ),
    accentColor: "border-t-purple-500/60",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.08)]",
  },
  {
    title: "Smart Categories",
    description: "Regex rules auto-categorize your apps and websites.",
    icon: Tags,
    size: "small",
    content: (
      <div className="flex flex-wrap gap-1.5">
        {["Dev", "Design", "Meetings", "Learning"].map((cat, i) => (
          <div
            key={cat}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              i === 0
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-700/50 text-zinc-400"
            }`}
          >
            {cat}
          </div>
        ))}
      </div>
    ),
    accentColor: "border-t-orange-500/60",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.08)]",
  },
  {
    title: "Detailed Reports",
    description: "Weekly and monthly summaries exported as CSV or JSON.",
    icon: FileText,
    size: "medium",
    content: (
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg bg-zinc-800/70 p-3 text-center">
          <div className="text-xl font-bold text-white">
            <AnimatedCounter value={42.5} suffix="h" />
          </div>
          <div className="text-xs text-zinc-500">This Week</div>
        </div>
        <div className="flex-1 rounded-lg bg-zinc-800/70 p-3 text-center">
          <div className="text-xl font-bold text-white">
            <AnimatedCounter value={168} suffix="h" />
          </div>
          <div className="text-xs text-zinc-500">This Month</div>
        </div>
      </div>
    ),
    accentColor: "border-t-cyan-500/60",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.08)]",
  },
];

export function BentoGrid() {
  return (
    <section id="dashboard" className="relative bg-zinc-950 py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950 to-zinc-950" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A dashboard built for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              developers
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Every feature designed with productivity in mind
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-4">
          {bentoItems.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className={`group relative overflow-hidden rounded-2xl border border-t-2 border-zinc-700/50 bg-zinc-900/80 p-7 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-800/80 ${item.accentColor} ${item.hoverGlow} ${
                item.size === "large"
                  ? "md:col-span-2 md:row-span-2"
                  : item.size === "medium"
                    ? "md:col-span-2"
                    : ""
              }`}
            >
              {/* Animated gradient border on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 animate-gradient-rotate" />
              </div>

              <div className="relative flex h-full flex-col">
                <div className="mb-4">
                  <item.icon className="h-5 w-5 text-zinc-400" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mb-5 text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>

                <div className="mt-auto">{item.content}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
