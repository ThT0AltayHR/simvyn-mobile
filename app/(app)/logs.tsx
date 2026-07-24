import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { EmptyState } from '@/components/EmptyState';
import type { LogEntry } from '@/types';

const LEVEL_COLORS: Record<string, string> = {
  error: '#f07a7a',
  warn: '#f5c842',
  info: '#77b3f0',
  debug: '#8e8e9c',
  verbose: '#4e4e5c',
};

export default function LogsScreen() {
  const colors = useColors();
  const { selectedDevice, serverUrl, lastEvent } = useSimvyn();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<FlatList>(null);

  const startStream = useCallback(() => {
    if (!selectedDevice || !serverUrl) return;
    if (wsRef.current) wsRef.current.close();
    setLogs([]);
    setStreaming(true);
    const wsUrl = serverUrl.replace(/^http/, 'ws') + `/log-viewer/stream/${selectedDevice.id}`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (evt) => {
      try {
        const entry: LogEntry = JSON.parse(evt.data);
        setLogs((prev) => {
          const next = [...prev, entry];
          return next.length > 2000 ? next.slice(-1500) : next;
        });
      } catch (_) {}
    };
    ws.onclose = () => setStreaming(false);
    ws.onerror = () => setStreaming(false);
    wsRef.current = ws;
  }, [selectedDevice, serverUrl]);

  const stopStream = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setStreaming(false);
  };

  useEffect(() => { return () => { wsRef.current?.close(); }; }, []);

  const filtered = logs.filter((l) => {
    if (levelFilter && l.level !== levelFilter) return false;
    if (filter && !l.message.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  const exportLogs = () => {
    const txt = filtered.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.tag ? `(${l.tag}) ` : ''}${l.message}`).join('\n');
    console.log(txt); // In a real build would use Share API
  };

  if (!selectedDevice) {
    return <EmptyState icon="terminal" title="No Device Selected" subtitle="Select a device from the top bar to stream logs." />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Toolbar */}
      <View style={[styles.toolbar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}>
          <Feather name="search" size={13} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={filter}
            onChangeText={setFilter}
            placeholder="Filter logs..."
            placeholderTextColor={colors.mutedForeground}
          />
          {filter ? <TouchableOpacity onPress={() => setFilter('')}><Feather name="x" size={13} color={colors.mutedForeground} /></TouchableOpacity> : null}
        </View>
        <View style={styles.levels}>
          {['error', 'warn', 'info', 'debug'].map((lv) => (
            <TouchableOpacity
              key={lv}
              onPress={() => setLevelFilter(levelFilter === lv ? null : lv)}
              style={[styles.levelBtn, {
                backgroundColor: levelFilter === lv ? LEVEL_COLORS[lv] + '33' : 'transparent',
                borderColor: levelFilter === lv ? LEVEL_COLORS[lv] : colors.border,
                borderRadius: 6,
              }]}
            >
              <Text style={[styles.levelLabel, { color: levelFilter === lv ? LEVEL_COLORS[lv] : colors.mutedForeground }]}>{lv}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={streaming ? stopStream : startStream} style={[styles.streamBtn, {
            backgroundColor: streaming ? colors.destructive + '22' : colors.primary + '22',
            borderColor: streaming ? colors.destructive : colors.primary,
            borderRadius: 8,
          }]}>
            <Feather name={streaming ? 'square' : 'play'} size={13} color={streaming ? colors.destructive : colors.primary} />
            <Text style={[styles.streamLabel, { color: streaming ? colors.destructive : colors.primary }]}>
              {streaming ? 'Stop' : 'Stream'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLogs([])} style={[styles.iconBtn, { backgroundColor: colors.elevated, borderRadius: 8 }]}>
            <Feather name="trash-2" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Count */}
      <View style={[styles.countRow, { backgroundColor: colors.surface }]}>
        <Text style={[styles.countText, { color: colors.mutedForeground }]}>
          {filtered.length} entries · {selectedDevice.name}
        </Text>
        {streaming && <View style={[styles.liveDot, { backgroundColor: colors.statusBooted }]} />}
      </View>

      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.logRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.logLevel, { color: LEVEL_COLORS[item.level] ?? colors.mutedForeground, width: 46 }]}>
              {item.level.toUpperCase().slice(0, 4)}
            </Text>
            <Text style={[styles.logTag, { color: colors.accent }]} numberOfLines={1}>{item.tag ?? ''}</Text>
            <Text style={[styles.logMsg, { color: item.level === 'error' ? LEVEL_COLORS.error : colors.foreground }]} numberOfLines={2}>
              {item.message}
            </Text>
          </View>
        )}
        onContentSizeChange={() => { if (streaming) listRef.current?.scrollToEnd({ animated: false }); }}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <EmptyState icon="terminal" title={streaming ? 'Waiting for logs...' : 'No Logs'} subtitle={streaming ? '' : 'Tap Stream to start capturing device logs.'} />
        }
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderBottomWidth: 1, flexWrap: 'wrap' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 8, paddingVertical: 7, borderWidth: 1, minWidth: 120 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', padding: 0 },
  levels: { flexDirection: 'row', gap: 4 },
  levelBtn: { paddingHorizontal: 7, paddingVertical: 4, borderWidth: 1 },
  levelLabel: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  actions: { flexDirection: 'row', gap: 6 },
  streamBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  streamLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 4 },
  countText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  list: { flex: 1 },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 5, paddingHorizontal: 12, borderBottomWidth: 1, gap: 6 },
  logLevel: { fontSize: 9, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  logTag: { fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 2, maxWidth: 80 },
  logMsg: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
});
