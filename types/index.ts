export type Status = 'online' | 'offline' | 'checking' | 'error';

export interface CheckResult {
  timestamp: number;
  status: Status;
  responseTime: number | null;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  status: Status;
  lastChecked: number | null;
  history: CheckResult[];
  expectedStatus?: number;
  timeout?: number;
  keyword?: string;
  offlineSince?: number | null;
  alertSent?: boolean;
  alertDelayMs?: number;
}

export interface Incident {
  id: string;
  websiteId: string;
  websiteName: string;
  timestamp: number;
  previousStatus: Status;
  newStatus: Status;
  responseTime: number | null;
}

export interface AppState {
  websites: Website[];
  incidents: Incident[];
  webhookUrl?: string;
}
