"use client";

import { motion } from "framer-motion";
import { Github, Server } from "lucide-react";
import Link from "next/link";

function DotGrid() {
  return (
    <div
      className="absolute inset-0 animate-dot-pulse opacity-[0.07]"
      style={{
        backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />
  );
}

export function FooterCTA() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-32">
      <DotGrid />
      <div className="absolute inset-0 animate-gradient-rotate bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Stop wondering where
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              your day went.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Clone the repo, run two commands, and start tracking. Your data stays on your machine.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.a
              href="/how-it-works"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:bg-emerald-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
            >
              <Server className="h-5 w-5" />
              Get Started in 2 Minutes
            </motion.a>

            <motion.a
              href="https://github.com/anomaly/prodhub"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-base font-semibold text-white transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              <Github className="h-5 w-5 text-zinc-400" />
              View on GitHub
            </motion.a>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Multi-Platform
            </div>
            <div className="h-3 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Open Source
            </div>
            <div className="h-3 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1-6l6-4-6-4v8z" />
              </svg>
              Free Forever
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "How It Works", href: "/how-it-works" },
        { label: "Documentation", href: "/docs" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "GitHub", href: "https://github.com/anomaly/prodhub", external: true },
        { label: "Dashboard", href: "/dashboard" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Contributing", href: "https://github.com/anomaly/prodhub", external: true },
        { label: "Issues", href: "https://github.com/anomaly/prodhub/issues", external: true },
      ],
    },
  ];

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                ProdHub
              </span>
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Open source productivity tracking for developers. See where your
              time goes.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-zinc-600">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Open Source Project
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-500 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-500 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 md:flex-row">
          <p className="text-sm text-zinc-600">
            {new Date().getFullYear()} ProdHub. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/anomaly/prodhub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 transition-colors hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
