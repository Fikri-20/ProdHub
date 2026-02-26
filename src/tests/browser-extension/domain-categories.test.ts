import { describe, it, expect } from "vitest";
import { categorizeDomain, getKnownCategories } from "../../../browser-extension/src/domain-categories.js";

describe("categorizeDomain", () => {
  it("matches exact domain", () => {
    expect(categorizeDomain("github.com")).toBe("Development");
    expect(categorizeDomain("youtube.com")).toBe("Entertainment");
    expect(categorizeDomain("slack.com")).toBe("Communication");
  });

  it("strips www. prefix", () => {
    expect(categorizeDomain("www.github.com")).toBe("Development");
    expect(categorizeDomain("www.youtube.com")).toBe("Entertainment");
  });

  it("matches subdomain via parent domain", () => {
    expect(categorizeDomain("app.slack.com")).toBe("Communication");
    expect(categorizeDomain("gist.github.com")).toBe("Development");
    expect(categorizeDomain("m.youtube.com")).toBe("Entertainment");
  });

  it("matches specific subdomains before parent fallback", () => {
    expect(categorizeDomain("mail.google.com")).toBe("Communication");
    expect(categorizeDomain("docs.google.com")).toBe("Productivity");
    expect(categorizeDomain("meet.google.com")).toBe("Communication");
  });

  it("returns null for unknown domains", () => {
    expect(categorizeDomain("example.com")).toBeNull();
    expect(categorizeDomain("unknown-site.org")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(categorizeDomain("")).toBeNull();
  });
});

describe("getKnownCategories", () => {
  it("returns sorted unique category list", () => {
    const categories = getKnownCategories();
    expect(categories.length).toBeGreaterThan(0);
    // Check sorted
    const sorted = [...categories].sort();
    expect(categories).toEqual(sorted);
    // Check unique
    expect(new Set(categories).size).toBe(categories.length);
    // Check known ones exist
    expect(categories).toContain("Development");
    expect(categories).toContain("Entertainment");
    expect(categories).toContain("Communication");
  });
});
