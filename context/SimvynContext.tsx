import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Device } from '@/types';

const SERVER_URL_KEY = '@simvyn/server_url';
const FAVORITES_KEY = '@simvyn/favorites';

interface SimvynContextValue {
  serverUrl: string;
  setServerUrl: (url: string) => Promise<void>;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  testConnection: (url?: string) => Promise<boolean>;
  devices: Device[];
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  favorites: string[];
  toggleFavorite: (deviceId: string) => void;
  wsConnected: boolean;
  lastEvent: { channel: string; type: string; payload: unknown } | null;
}

const SimvynContext = createContext<SimvynContextValue | null>(null);

export function SimvynProvider({ children }: { children: React.ReactNode }) {
  const [serverUrl, setServerUrlState] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ channel: string; type: string; payload: unknown } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const [saved, savedFavs] = await Promise.all([
        AsyncStorage.getItem(SERVER_URL_KEY),
        AsyncStorage.getItem(FAVORITES_KEY),
      ]);
      if (saved) {
        setServerUrlState(saved);
        testAndConnect(saved);
      }
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    })();
  }, []);

  const testAndConnect = async (url: string) => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setIsConnected(true);
      fetchDevices(url);
      connectWs(url);
      return true;
    } catch (e: unknown) {
      setIsConnected(false);
      setConnectionError(e instanceof Error ? e.message : 'Connection failed');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchDevices = async (url: string) => {
    try {
      const res = await fetch(`${url}/device-management/list`);
      if (res.ok) {
        const data = await res.json();
        setDevices(Array.isArray(data) ? data : data.devices ?? []);
      }
    } catch (_) {}
  };

  const connectWs = (url: string) => {
    if (wsRef.current) wsRef.current.close();
    const wsUrl = url.replace(/^http/, 'ws') + '/ws';
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimer.current = setTimeout(() => connectWs(url), 3000);
      };
      ws.onerror = () => setWsConnected(false);
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          setLastEvent({ channel: msg.channel, type: msg.type, payload: msg.payload });
          if (msg.channel === 'devices') {
            if (msg.type === 'device-list') setDevices(msg.payload);
            if (msg.type === 'device-updated') {
              setDevices((d) => d.map((dev) => (dev.id === msg.payload.id ? msg.payload : dev)));
            }
          }
        } catch (_) {}
      };
    } catch (_) {}
  };

  const setServerUrl = async (url: string) => {
    const clean = url.replace(/\/$/, '');
    await AsyncStorage.setItem(SERVER_URL_KEY, clean);
    setServerUrlState(clean);
    setIsConnected(false);
    setDevices([]);
    setSelectedDevice(null);
  };

  const testConnection = useCallback(async (url?: string) => {
    return testAndConnect(url ?? serverUrl);
  }, [serverUrl]);

  const toggleFavorite = useCallback((deviceId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SimvynContext.Provider value={{
      serverUrl, setServerUrl, isConnected, isConnecting, connectionError,
      testConnection, devices, selectedDevice, setSelectedDevice, favorites,
      toggleFavorite, wsConnected, lastEvent,
    }}>
      {children}
    </SimvynContext.Provider>
  );
}

export function useSimvyn() {
  const ctx = useContext(SimvynContext);
  if (!ctx) throw new Error('useSimvyn must be used inside SimvynProvider');
  return ctx;
}
