"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Github, Menu, X, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/docs", label: "Docs", icon: FileText },
    {
      href: "https://github.com/anomaly/prodhub",
      label: "GitHub",
      icon: Github,
      external: true,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-zinc-800 bg-zinc-950/95 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">
            ProdHub
          </span>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const LinkComponent = link.external ? "a" : Link;
            return (
              <LinkComponent
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  !link.external && isActive(link.href)
                    ? "text-emerald-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
                {!link.external && isActive(link.href) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-emerald-500"
                  />
                )}
              </LinkComponent>
            );
          })}
          <motion.a
            href="/dashboard"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="animate-pulse-glow rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-shadow hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
          >
            Dashboard
          </motion.a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-zinc-800/50 md:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => {
                const LinkComponent = link.external ? "a" : Link;
                return (
                  <LinkComponent
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      !link.external && isActive(link.href)
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    }`}
                  >
                    {link.icon && <link.icon className="h-4 w-4" />}
                    {link.label}
                  </LinkComponent>
                );
              })}
              <a
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Dashboard
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
