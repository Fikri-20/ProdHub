/**
 * Client-side domain categorization for popup display.
 * Maps known domains to human-readable category labels.
 * The server-side categorization engine handles the actual
 * category assignment via regex rules on windowTitle (which
 * now includes the domain).
 */

const DOMAIN_CATEGORY_MAP: Record<string, string> = {
  // Development
  "github.com": "Development",
  "gitlab.com": "Development",
  "bitbucket.org": "Development",
  "stackoverflow.com": "Development",
  "stackexchange.com": "Development",
  "developer.mozilla.org": "Development",
  "npmjs.com": "Development",
  "crates.io": "Development",
  "pypi.org": "Development",
  "docs.rs": "Development",
  "codepen.io": "Development",
  "codesandbox.io": "Development",
  "replit.com": "Development",
  "vercel.com": "Development",
  "netlify.com": "Development",
  "heroku.com": "Development",

  // Communication
  "mail.google.com": "Communication",
  "outlook.live.com": "Communication",
  "outlook.office.com": "Communication",
  "slack.com": "Communication",
  "discord.com": "Communication",
  "teams.microsoft.com": "Communication",
  "zoom.us": "Communication",
  "meet.google.com": "Communication",
  "web.whatsapp.com": "Communication",
  "messenger.com": "Communication",
  "telegram.org": "Communication",

  // Social Media
  "twitter.com": "Social Media",
  "x.com": "Social Media",
  "facebook.com": "Social Media",
  "instagram.com": "Social Media",
  "reddit.com": "Social Media",
  "linkedin.com": "Social Media",
  "tiktok.com": "Social Media",
  "threads.net": "Social Media",

  // Entertainment
  "youtube.com": "Entertainment",
  "netflix.com": "Entertainment",
  "twitch.tv": "Entertainment",
  "spotify.com": "Entertainment",
  "music.youtube.com": "Entertainment",
  "soundcloud.com": "Entertainment",
  "hulu.com": "Entertainment",
  "disneyplus.com": "Entertainment",
  "primevideo.com": "Entertainment",

  // Productivity
  "docs.google.com": "Productivity",
  "sheets.google.com": "Productivity",
  "slides.google.com": "Productivity",
  "notion.so": "Productivity",
  "trello.com": "Productivity",
  "asana.com": "Productivity",
  "jira.atlassian.net": "Productivity",
  "linear.app": "Productivity",
  "figma.com": "Productivity",
  "miro.com": "Productivity",
  "airtable.com": "Productivity",

  // AI / Research
  "chat.openai.com": "AI",
  "chatgpt.com": "AI",
  "claude.ai": "AI",
  "gemini.google.com": "AI",
  "perplexity.ai": "AI",
  "bard.google.com": "AI",

  // Learning
  "udemy.com": "Learning",
  "coursera.org": "Learning",
  "edx.org": "Learning",
  "khanacademy.org": "Learning",
  "pluralsight.com": "Learning",
  "egghead.io": "Learning",
  "frontendmasters.com": "Learning",

  // News / Reading
  "news.ycombinator.com": "News",
  "medium.com": "Reading",
  "dev.to": "Reading",
  "hashnode.dev": "Reading",
  "substack.com": "Reading",

  // Shopping
  "amazon.com": "Shopping",
  "ebay.com": "Shopping",
  "etsy.com": "Shopping",
};

/**
 * Categorize a domain by checking exact match, then parent domain match.
 * Returns null if no category found.
 */
export function categorizeDomain(hostname: string): string | null {
  // Exact match
  const exact = DOMAIN_CATEGORY_MAP[hostname];
  if (exact) return exact;

  // Strip www. prefix and try again
  const withoutWww = hostname.replace(/^www\./, "");
  const stripped = DOMAIN_CATEGORY_MAP[withoutWww];
  if (stripped) return stripped;

  // Try parent domain (e.g., "app.slack.com" → "slack.com")
  const parts = withoutWww.split(".");
  if (parts.length > 2) {
    const parent = parts.slice(-2).join(".");
    const parentMatch = DOMAIN_CATEGORY_MAP[parent];
    if (parentMatch) return parentMatch;
  }

  return null;
}

/**
 * Get all known categories for display purposes.
 */
export function getKnownCategories(): string[] {
  return [...new Set(Object.values(DOMAIN_CATEGORY_MAP))].sort();
}
