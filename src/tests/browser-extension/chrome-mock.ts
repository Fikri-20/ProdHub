type StorageData = Record<string, unknown>;

function createStorageArea() {
  let data: StorageData = {};

  return {
    _data: () => data,
    _reset: () => { data = {}; },
    get: async (keys?: string | string[] | null): Promise<StorageData> => {
      if (!keys) return { ...data };
      const keyList = typeof keys === "string" ? [keys] : keys;
      const result: StorageData = {};
      for (const key of keyList) {
        if (key in data) {
          result[key] = data[key];
        }
      }
      return result;
    },
    set: async (items: StorageData): Promise<void> => {
      Object.assign(data, items);
    },
    remove: async (keys: string | string[]): Promise<void> => {
      const keyList = typeof keys === "string" ? [keys] : keys;
      for (const key of keyList) {
        delete data[key];
      }
    },
    clear: async (): Promise<void> => {
      data = {};
    },
  };
}

export function createChromeMock() {
  const syncStorage = createStorageArea();
  const localStorage = createStorageArea();

  const mock = {
    storage: {
      sync: syncStorage,
      local: localStorage,
      onChanged: {
        addListener: () => {},
      },
    },
    runtime: {
      onInstalled: { addListener: () => {} },
      onStartup: { addListener: () => {} },
    },
    tabs: {
      onActivated: { addListener: () => {} },
      onUpdated: { addListener: () => {} },
      query: async () => [],
    },
    windows: {
      onFocusChanged: { addListener: () => {} },
      WINDOW_ID_NONE: -1,
    },
    alarms: {
      create: () => {},
      onAlarm: { addListener: () => {} },
    },
    _resetAll: () => {
      syncStorage._reset();
      localStorage._reset();
    },
  };

  return mock;
}

export function installChromeMock() {
  const mock = createChromeMock();
  (globalThis as Record<string, unknown>).chrome = mock;
  return mock;
}
