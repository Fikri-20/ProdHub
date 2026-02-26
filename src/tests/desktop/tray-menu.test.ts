import { describe, expect, it, vi } from "vitest";
import {
  DESKTOP_APP_NAME,
  TRAY_QUIT_LABEL,
  TRAY_STATUS_LABEL,
} from "../../desktop/tray-constants.js";
import { buildTrayMenuTemplate } from "../../desktop/tray-menu.js";

describe("buildTrayMenuTemplate", () => {
  it("builds the expected static menu entries", () => {
    const template = buildTrayMenuTemplate({ onQuit: vi.fn() });

    expect(template).toHaveLength(5);
    expect(template[0]).toMatchObject({
      label: DESKTOP_APP_NAME,
      enabled: false,
    });
    expect(template[1]).toMatchObject({ type: "separator" });
    expect(template[2]).toMatchObject({
      label: TRAY_STATUS_LABEL,
      enabled: false,
    });
    expect(template[3]).toMatchObject({ type: "separator" });
    expect(template[4]).toMatchObject({ label: TRAY_QUIT_LABEL });
  });

  it("wires the quit handler to the quit menu item", () => {
    const onQuit = vi.fn();
    const template = buildTrayMenuTemplate({ onQuit });
    const quitItem = template.find((item) => item.label === TRAY_QUIT_LABEL);

    expect(quitItem).toBeDefined();
    expect(typeof quitItem?.click).toBe("function");

    quitItem?.click?.(undefined as never, undefined as never, undefined as never);

    expect(onQuit).toHaveBeenCalledTimes(1);
  });
});
