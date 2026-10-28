/* Dummy contract registry shapes for the design prototype. No API: data lives in data/ and in localStorage. */

export type MilestoneStatus = "done" | "current" | "pending";

export type ReportStatus = 0 | 1 | 2;

export interface Milestone {
  label: string;
  date: string;
  status: MilestoneStatus;
  note?: string;
}

export interface Report {
  id: string;
  category: string;
  clause: string;
  text: string;
  location?: string;
  date: string;
  status: ReportStatus;
  reporter: string;
  response?: string;
  photos?: number;
}

export interface Clause {
  title: string;
  text: string;
}

export interface Contract {
  code: string;
  type: string;
  title: string;
  village: string;
  first: string;
  second: string;
  value: number;
  valueNote?: string;
  duration: string;
  start: string;
  progress: number;
  clauses: Clause[];
  milestones: Milestone[];
  reports: Report[];
  fromSimulation?: boolean;
}

export interface SealedContract extends Contract {
  hash: string;
}
