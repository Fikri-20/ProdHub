export interface Goal {
  id: string;
  name: string;
  targetSeconds: number;
  appFilter: string | null;
  userId: string;
  createdAt: string;
}

export interface GoalWithProgress extends Goal {
  currentSeconds: number;
  percentage: number;
}

export interface GoalFormData {
  name: string;
  targetSeconds: number;
  appFilter: string | null;
}
