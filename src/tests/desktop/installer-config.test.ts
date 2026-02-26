import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface ElectronBuilderConfig {
  appId: string;
  productName: string;
  directories?: {
    app?: string;
    output?: string;
  };
  extraMetadata?: { main?: string };
  win?: {
    artifactName?: string;
    signAndEditExecutable?: boolean;
    target?: Array<{ target?: string; arch?: string[] }>;
  };
  nsis?: {
    oneClick?: boolean;
    allowToChangeInstallationDirectory?: boolean;
  };
}

function loadInstallerConfig(): ElectronBuilderConfig {
  const configPath = resolve(process.cwd(), "electron-builder.json");
  const file = readFileSync(configPath, "utf8");
  return JSON.parse(file) as ElectronBuilderConfig;
}

describe("electron-builder config", () => {
  it("defines Windows NSIS x64 target", () => {
    const config = loadInstallerConfig();
    const target = config.win?.target?.[0];

    expect(target?.target).toBe("nsis");
    expect(target?.arch).toEqual(["x64"]);
  });

  it("disables executable editing/signing for unsigned local builds", () => {
    const config = loadInstallerConfig();

    expect(config.win?.signAndEditExecutable).toBe(false);
  });

  it("uses desktop entrypoint as packaged main file", () => {
    const config = loadInstallerConfig();

    expect(config.extraMetadata?.main).toBe("main.js");
  });

  it("writes artifacts into the shared release directory", () => {
    const config = loadInstallerConfig();

    expect(config.directories?.output).toBe("../../release/desktop-installer");
  });

  it("uses stable installer artifact naming", () => {
    const config = loadInstallerConfig();

    expect(config.win?.artifactName).toBe(
      "ProdHub-Agent-Setup-${version}-${arch}.${ext}",
    );
  });

  it("uses non-one-click installer with change-directory option", () => {
    const config = loadInstallerConfig();

    expect(config.nsis?.oneClick).toBe(false);
    expect(config.nsis?.allowToChangeInstallationDirectory).toBe(true);
  });
});
