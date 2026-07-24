import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import type { FileEntry } from '@/types';

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
};

export default function FilesScreen() {
  const colors = useColors();
  const { selectedDevice } = useSimvyn();
  const { get } = useApi();
  const [bundleId, setBundleId] = useState('');
  const [path, setPath] = useState('/');
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['/']);
  const [refreshing, setRefreshing] = useState(false);

  const loadDir = async (dirPath: string) => {
    if (!selectedDevice || !bundleId) return;
    setLoading(true);
    try {
      const data = await get(`/file-system/list/${selectedDevice.id}/${encodeURIComponent(bundleId)}?path=${encodeURIComponent(dirPath)}`);
      setEntries(Array.isArray(data) ? data : data.entries ?? []);
    } catch (_) { setEntries([]); }
    setLoading(false);
  };

  const navigate = (entry: FileEntry) => {
    if (!entry.isDirectory) return;
    const newPath = entry.path;
    setPath(newPath);
    setBreadcrumbs((prev) => [...prev, newPath]);
    loadDir(newPath);
  };

  const goBack = () => {
    if (breadcrumbs.length <= 1) return;
    const newBreadcrumbs = breadcrumbs.slice(0, -1);
    const prev = newBreadcrumbs[newBreadcrumbs.length - 1];
    setBreadcrumbs(newBreadcrumbs);
    setPath(prev);
    loadDir(prev);
  };

  const onRefresh = async () => { setRefreshing(true); await loadDir(path); setRefreshing(false); };

  if (!selectedDevice) return <EmptyState icon="folder" title="No Device Selected" subtitle="Select a device to browse app files." />;

  if (!bundleId) {
    return (
      <View style={[{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Feather name="folder" size={40} color={colors.mutedForeground} />
        <Text style={[{ color: colors.foreground, fontSize: 15, fontFamily: 'Inter_600SemiBold', marginTop: 12, textAlign: 'center' }]}>Enter Bundle ID to Browse Files</Text>
        <TouchableOpacity
          onPress={() => { setBundleId('com.example.app'); loadDir('/'); }}
          style={[{ backgroundColor: colors.primary, borderRadius: colors.radius, paddingHorizontal: 20, paddingVertical: 10, marginTop: 16 }]}
        >
          <Text style={[{ color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>Use Example</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <LoadingState label="Loading files..." />;

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }]}>
      {/* Breadcrumb */}
      <View style={[styles.breadcrumb, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {breadcrumbs.length > 1 && (
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.pathText, { color: colors.mutedForeground }]} numberOfLines={1}>{path}</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(i) => i.path}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        scrollEnabled={!!entries.length}
        contentContainerStyle={{ paddingVertical: 6, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigate(item)}
            disabled={!item.isDirectory}
            style={[styles.fileRow, { borderBottomColor: colors.border }]}
          >
            <Feather
              name={item.isDirectory ? 'folder' : 'file'}
              size={16}
              color={item.isDirectory ? '#f5c842' : colors.mutedForeground}
            />
            <Text style={[styles.fileName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
            {item.size !== undefined && (
              <Text style={[styles.fileSize, { color: colors.mutedForeground }]}>{formatSize(item.size)}</Text>
            )}
            {item.isDirectory && <Feather name="chevron-right" size={13} color={colors.mutedForeground} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="folder" title="Empty Directory" subtitle="No files in this location." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  breadcrumb: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, gap: 8 },
  backBtn: { padding: 2 },
  pathText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular' },
  fileRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10, borderBottomWidth: 1 },
  fileName: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  fileSize: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
