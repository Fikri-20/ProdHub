"use client";

import { motion } from "framer-motion";

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.913 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.504 0c-.155 0-.311.01-.455.034v-.004C8.369.456 5.577 4.028 5.192 7.869c-.015.127-.022.256-.022.386 0 .398.027.788.082 1.166.028.194.06.384.1.572.067.31.152.612.252.906-.105.254-.19.518-.26.789a9.724 9.724 0 0 0-.274 1.598c-.063.528-.087 1.09-.051 1.675.066 1.09.34 2.13.782 3.04.234.49.515.95.839 1.373.228.298.481.577.755.837L12 24l4.761-3.768c.274-.26.527-.54.755-.837.324-.424.605-.883.839-1.373.443-.91.716-1.95.782-3.04.036-.585.012-1.147-.05-1.675a9.724 9.724 0 0 0-.275-1.598 5.254 5.254 0 0 0-.26-.79c.1-.293.185-.596.252-.905.04-.188.072-.378.1-.572.055-.378.082-.768.082-1.166 0-.13-.007-.259-.022-.386C18.423 4.028 15.631.456 11.951.03 11.805.01 11.649 0 11.496 0h1.008z" />
    </svg>
  );
}

function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848c.388.042.782.063 1.18.063 6.627 0 12-5.373 12-12 0-1.163-.166-2.286-.475-3.348zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728z" />
    </svg>
  );
}

function EdgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.86 17.86q.14 0 .25.12.1.13.1.25t-.11.33l-.32.46q-.43.58-1.15 1.11a7.3 7.3 0 0 1-1.6.86 8.11 8.11 0 0 1-3.28.67c-1.24 0-2.41-.23-3.5-.68a8.81 8.81 0 0 1-2.87-1.9 8.95 8.95 0 0 1-2.59-6.29c0-.88.13-1.74.37-2.58a8.82 8.82 0 0 1 3.41-4.67A9.18 9.18 0 0 1 16.14 3c1.33 0 2.43.2 3.3.58.87.39 1.52.84 1.97 1.26.54.48.97.95 1.27 1.42.3.47.5.86.59 1.18l.14.37c0 .14-.06.26-.17.34-.11.08-.23.12-.35.12H13.6c-.06 0-.12.02-.18.06a.24.24 0 0 0-.07.18c0 .54.14 1.04.42 1.5.28.47.67.84 1.17 1.13a3.6 3.6 0 0 0 1.7.43c1 0 1.92-.34 2.75-1.03.83-.69 1.36-1.59 1.58-2.7.02-.13.09-.2.21-.2h.68z" />
    </svg>
  );
}

function VSCodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
    </svg>
  );
}

const platforms = [
  { name: "Windows", Icon: WindowsIcon, color: "text-sky-400" },
  { name: "macOS", Icon: AppleIcon, color: "text-zinc-300" },
  { name: "Linux", Icon: LinuxIcon, color: "text-amber-400" },
  { name: "Chrome", Icon: ChromeIcon, color: "text-green-400" },
  { name: "Edge", Icon: EdgeIcon, color: "text-blue-400" },
  { name: "VS Code", Icon: VSCodeIcon, color: "text-blue-500" },
];

export function PlatformMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-zinc-800/50 bg-zinc-900/30 py-16">
      <div className="absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-zinc-950 to-transparent" />

      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Track seamlessly across your entire workflow
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative flex overflow-hidden"
      >
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex gap-6"
        >
          {[...platforms, ...platforms].map((platform, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex min-w-[160px] items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-5 py-4 backdrop-blur-sm transition-colors hover:border-zinc-700 hover:bg-zinc-800/60"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80 ${platform.color}`}>
                <platform.Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-300">
                {platform.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
