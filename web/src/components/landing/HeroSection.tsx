"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";
import { ArrowRight, BookOpen } from "lucide-react";

// Seeded pseudo-random number generator (mulberry32)
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
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function MockHeatmap() {
  const weeks = 52;
  const days = 7;

  const cells = useMemo(() => {
    const rng = seededRandom(42);
    return Array.from({ length: weeks }, () =>
      Array.from({ length: days }, () => {
        const intensity = rng();
        if (intensity > 0.8) return "bg-emerald-500";
        if (intensity > 0.6) return "bg-emerald-600";
        if (intensity > 0.4) return "bg-emerald-700";
        if (intensity > 0.2) return "bg-emerald-800";
        return "bg-zinc-800";
      })
    );
  }, []);

  return (
    <div className="flex gap-[3px]">
      {cells.map((week, weekIdx) => (
        <div key={weekIdx} className="flex flex-col gap-[3px]">
          {week.map((bgClass, dayIdx) => (
            <div
              key={dayIdx}
              className={`h-[11px] w-[11px] rounded-sm ${bgClass}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent blur-3xl" />
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/90 shadow-2xl shadow-black/50 backdrop-blur-sm"
      >
        {/* Shimmer sweep */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
          />
        </div>

        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="ml-4 flex items-center gap-2 rounded-md bg-zinc-800/50 px-3 py-1.5">
            <div className="h-3 w-3 rounded-sm bg-emerald-600" />
            <div className="h-2 w-24 rounded-sm bg-zinc-700" />
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-5 w-32 rounded-md bg-zinc-700" />
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-emerald-500"
              />
              <div className="h-3 w-16 rounded-md bg-emerald-900/50 text-[10px] font-medium text-emerald-400" />
            </div>
          </div>

          <div className="mb-4 overflow-x-auto">
            <MockHeatmap />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
              <div className="mb-2 h-2.5 w-20 rounded-sm bg-zinc-700" />
              <div className="text-2xl font-bold text-white">8h 42m</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                />
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
              <div className="mb-2 h-2.5 w-24 rounded-sm bg-zinc-700" />
              <div className="text-2xl font-bold text-white">156 events</div>
              <div className="mt-2 flex gap-1">
                {["VS Code", "Chrome", "Terminal"].map((app, i) => (
                  <div
                    key={app}
                    className={`rounded-md px-2 py-0.5 text-xs ${i === 0 ? "bg-emerald-900/50 text-emerald-400" : "bg-zinc-700/50 text-zinc-400"}`}
                  >
                    {app}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const stats = [
  { value: 6, suffix: "", label: "Platforms" },
  { value: 0, suffix: "", label: "Cloud Dependencies" },
  { value: 100, suffix: "%", label: "Your Data" },
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen overflow-hidden bg-zinc-950 pt-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />

      <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[100px]" />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating accent elements */}
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[15%] top-[30%] h-3 w-3 rounded-full bg-emerald-500/30 blur-sm"
      />
      <motion.div
        animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute right-[20%] top-[25%] h-2 w-2 rounded-full bg-emerald-400/25 blur-sm"
      />
      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute left-[30%] bottom-[40%] h-2.5 w-2.5 rounded-full bg-emerald-500/20 blur-sm"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-emerald-500"
                />
                Open Source & Built for Developers
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Own Your Data.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Track Your Time.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400 lg:text-xl"
            >
              Self-hosted, open-source activity tracker. Your data never
              leaves your machine. Zero configuration, zero cloud dependency.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <motion.a
                href="/install"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.a>

              <a
                href="https://github.com/anomaly/prodhub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-6 py-3.5 text-base font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white"
              >
                <BookOpen className="h-4 w-4" />
                View on GitHub
              </a>
            </motion.div>

            {/* Stats row with animated counters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="mt-12 flex gap-8"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {stat.value === 2 ? (
                        <><AnimatedCounter value={stat.value} />{stat.suffix}</>
                      ) : (
                        <><AnimatedCounter value={stat.value} />{stat.suffix}</>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div style={{ y, opacity }} className="relative lg:pl-8">
            <MockDashboard />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
    </section>
  );
}
