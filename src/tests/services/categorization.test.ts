import { describe, it, expect } from "vitest";
import { matchesCategory } from "../../services/categorization.js";

describe("matchesCategory", () => {
  it("should return false for empty rules array", () => {
    expect(matchesCategory("VS Code", "file.ts", [])).toBe(false);
  });

  it("should match on appName", () => {
    expect(matchesCategory("VS Code", "file.ts", ["VS Code"])).toBe(true);
  });

  it("should match on windowTitle", () => {
    expect(matchesCategory("Chrome", "GitHub - ProdHub", ["GitHub"])).toBe(true);
  });

  it("should be case-insensitive", () => {
    expect(matchesCategory("vs code", "file.ts", ["VS Code"])).toBe(true);
    expect(matchesCategory("VS CODE", "file.ts", ["vs code"])).toBe(true);
  });

  it("should support regex patterns", () => {
    expect(matchesCategory("VS Code", "server.ts - ProdHub", [".*\\.ts"])).toBe(true);
    expect(matchesCategory("Chrome", "docs.google.com", ["google\\.com"])).toBe(true);
  });

  it("should match if ANY rule matches", () => {
    expect(matchesCategory("Slack", "general", ["VS Code", "Slack", "Terminal"])).toBe(true);
  });

  it("should return false when no rules match", () => {
    expect(matchesCategory("Spotify", "Now Playing", ["VS Code", "Chrome"])).toBe(false);
  });

  it("should support partial matches (regex default behavior)", () => {
    expect(matchesCategory("VS Code", "file.ts", ["Code"])).toBe(true);
    expect(matchesCategory("Chrome", "long window title", ["window"])).toBe(true);
  });

  it("should handle special regex characters in rules gracefully", () => {
    // A valid regex with special chars
    expect(matchesCategory("C++", "main.cpp", ["C\\+\\+"])).toBe(true);
    // A rule with unescaped special chars that forms an invalid regex should be skipped
    expect(matchesCategory("test", "test", ["[invalid"])).toBe(false);
  });

  it("should skip invalid regex rules and continue matching", () => {
    // First rule is invalid, second should still match
    expect(matchesCategory("VS Code", "file.ts", ["[invalid", "VS Code"])).toBe(true);
  });

  it("should handle empty strings for appName and windowTitle", () => {
    expect(matchesCategory("", "", ["something"])).toBe(false);
  });

  it("should match against both appName and windowTitle independently", () => {
    // Rule matches windowTitle but not appName
    expect(matchesCategory("Notepad", "README.md", ["README"])).toBe(true);
    // Rule matches appName but not windowTitle
    expect(matchesCategory("Firefox", "New Tab", ["Firefox"])).toBe(true);
  });
});
