export type Platform = 'ios' | 'android';
export type DeviceState = 'booted' | 'shutdown' | 'creating' | 'shutting-down';

export interface Device {
  id: string;
  name: string;
  platform: Platform;
  state: DeviceState;
  osVersion: string;
  deviceType: string;
  isAvailable: boolean;
}

export interface AppInfo {
  bundleId: string;
  name: string;
  version?: string;
  buildVersion?: string;
  dataSize?: number;
  isSystem?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'verbose';
  tag?: string;
  message: string;
  pid?: number;
}

export interface CrashLogEntry {
  id: string;
  process: string;
  timestamp: string;
  path?: string;
  preview: string;
}

export interface LocationFavorite {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Screenshot {
  filename: string;
  deviceId: string;
  timestamp: string;
  type: 'screenshot' | 'recording';
  size?: number;
}

export interface DeepLink {
  id: string;
  url: string;
  label?: string;
}

export interface PushTemplate {
  id: string;
  name: string;
  payload: string;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modifiedAt?: string;
}

export interface DatabaseTable {
  name: string;
  rowCount?: number;
}

export interface Collection {
  id: string;
  name: string;
  steps: CollectionStep[];
  createdAt: string;
}

export interface CollectionStep {
  id: string;
  action: string;
  params: Record<string, unknown>;
}

export interface DeviceCapabilities {
  setLocation: boolean;
  push: boolean;
  screenshot: boolean;
  screenRecord: boolean;
  erase: boolean;
  statusBar: boolean;
  privacy: boolean;
  clipboard: boolean;
  addMedia: boolean;
  logs: boolean;
  deepLinks: boolean;
  appManagement: boolean;
  fileSystem: boolean;
  database: boolean;
  settings: boolean;
  accessibility: boolean;
  crashLogs: boolean;
  deviceLifecycle: boolean;
  orientation: boolean;
}

export interface SimvynModule {
  name: string;
  label: string;
  description?: string;
}

export interface HealthStatus {
  status: string;
  uptime?: number;
  deviceCount?: number;
  version?: string;
}
