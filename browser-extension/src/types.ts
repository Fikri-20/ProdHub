export interface ExtensionConfig {
  apiBaseUrl: string;
  apiKey: string;
  deviceName: string;
  trackingEnabled: boolean;
}

export interface TabSession {
  tabId: number;
  url: string;
  title: string;
  domain: string;
  startTime: number;
}

export interface DailyStats {
  date: string;
  domains: Record<string, number>;
}

export const DEFAULT_CONFIG: ExtensionConfig = {
  apiBaseUrl: "http://localhost:3000",
  apiKey: "",
  deviceName: "Chrome Browser",
  trackingEnabled: true,
};

export const ALARM_NAME = "prodhub-flush";
export const ALARM_INTERVAL_MINUTES = 5;
