export interface DeviceInfo {
  id: string;
  name: string;
  os: string;
  userId: string;
  createdAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  rules: string[];
  userId: string;
}

export interface CategoryAssignmentWithCategory {
  id: string;
  eventId: string;
  categoryId: string;
  category: CategoryInfo;
}

export interface ActivityEventWithRelations {
  id: string;
  deviceId: string;
  appName: string;
  windowTitle: string;
  startTime: string;
  endTime: string;
  duration: number;
  device: DeviceInfo;
  categories: CategoryAssignmentWithCategory[];
}

export interface TimelineGroup {
  date: string; // ISO date string (YYYY-MM-DD)
  label: string; // Formatted date label
  events: ActivityEventWithRelations[];
}

export type DateRangePreset = "today" | "yesterday" | "7d" | "30d";
