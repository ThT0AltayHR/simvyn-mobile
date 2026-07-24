import { useCallback } from 'react';
import { useSimvyn } from '@/context/SimvynContext';

export function useApi() {
  const { serverUrl } = useSimvyn();

  const get = useCallback(async (path: string) => {
    const res = await fetch(`${serverUrl}${path}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return res.json();
  }, [serverUrl]);

  const post = useCallback(async (path: string, body?: unknown) => {
    const res = await fetch(`${serverUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return res.json().catch(() => ({}));
  }, [serverUrl]);

  const del = useCallback(async (path: string, body?: unknown) => {
    const res = await fetch(`${serverUrl}${path}`, {
      method: 'DELETE',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return res.json().catch(() => ({}));
  }, [serverUrl]);

  const put = useCallback(async (path: string, body?: unknown) => {
    const res = await fetch(`${serverUrl}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return res.json().catch(() => ({}));
  }, [serverUrl]);

  const uploadFile = useCallback(async (path: string, formData: FormData) => {
    const res = await fetch(`${serverUrl}${path}`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return res.json().catch(() => ({}));
  }, [serverUrl]);

  return { get, post, del, put, uploadFile, serverUrl };
}
